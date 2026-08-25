import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fault, FAULT_DIM_NOTE } from '../src/lib/calc/fault.ts';
import { faultSequence, isFaultComplete, maxScore, scoreFault } from '../src/lib/calc/engine.ts';

/** Answer every degree item with the given choice, and every direction with `dir`. */
function answerAll(pick, dir = 1) {
  const answers = { [fault.safety.id]: 0 };
  for (const q of fault.questions) {
    answers[q.id] = pick(q);
    answers[q.direction.id] = dir;
  }
  return answers;
}

const worst = (q) => q.choices.reduce((hi, c, i) => (c.score > q.choices[hi].score ? i : hi), 0);
const best = (q) => q.choices.reduce((lo, c, i) => (c.score < q.choices[lo].score ? i : lo), 0);

const SPOUSE = 0; // 주로 배우자 쪽
const BOTH = 1;
const SELF = 2; // 주로 내 쪽

test('dimension weights sum to exactly 1', () => {
  const sum = fault.dims.reduce((s, d) => s + d.weight, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, `weights sum to ${sum}`);
});

test('every question is well formed and carries a direction follow-up', () => {
  const seen = new Set();
  for (const q of fault.questions) {
    assert.ok(!seen.has(q.id), `duplicate id ${q.id}`);
    seen.add(q.id);
    assert.ok(fault.dims.some((d) => d.key === q.dim), `${q.id}: undeclared dimension`);
    assert.equal(maxScore(q), 4, `${q.id}: every item tops out at 4`);
    assert.ok(
      q.choices.some((c) => c.score === 0),
      `${q.id}: must be answerable with "없었다"`,
    );
    assert.ok(q.direction, `${q.id}: needs a direction question`);
    assert.equal(q.direction.id, `${q.id}D`);
    assert.equal(q.direction.choices.length, 3);
    // The three shares must be symmetric, or the tool would lean one way by
    // construction.
    const shares = q.direction.choices.map((c) => c.selfShare);
    assert.deepEqual(shares, [0.15, 0.5, 0.85]);
  }
  for (const dim of fault.dims) {
    assert.ok(FAULT_DIM_NOTE[dim.key], `${dim.key}: no result-page note`);
    assert.ok(fault.questions.some((q) => q.dim === dim.key), `${dim.key}: no questions`);
  }
});

test('fault ids never collide with the risk calculators', () => {
  for (const q of fault.questions) {
    assert.match(q.id, /^FT\d+$/);
  }
});

test('the follow-up only appears once something is reported', () => {
  const nothing = {};
  for (const q of fault.questions) nothing[q.id] = best(q);
  nothing[fault.safety.id] = 0;
  const quiet = faultSequence(fault, nothing);
  assert.equal(quiet.length, 1 + fault.questions.length, 'no direction questions when nothing happened');

  const something = { ...nothing, FT1: worst(fault.questions[0]) };
  const seq = faultSequence(fault, something);
  assert.equal(seq.length, 2 + fault.questions.length);
  assert.equal(seq[2].id, 'FT1D', 'the follow-up sits directly under its parent');
});

test('completion tracks the visible questions only', () => {
  const answers = {};
  for (const q of fault.questions) answers[q.id] = best(q);
  answers[fault.safety.id] = 0;
  assert.equal(isFaultComplete(fault, answers), true);

  answers.FT5 = worst(fault.questions.find((q) => q.id === 'FT5'));
  assert.equal(isFaultComplete(fault, answers), false, 'the new follow-up is unanswered');
  answers.FT5D = BOTH;
  assert.equal(isFaultComplete(fault, answers), true);
});

test('nothing reported means no ratio at all', () => {
  const result = scoreFault(fault, answerAll(best));
  assert.equal(result.undecided, true);
  assert.equal(result.selfRatio, null);
  assert.equal(result.spouseRatio, null);
  assert.equal(result.band, null);
});

test('one side at fault reads as that side', () => {
  const spouse = scoreFault(fault, answerAll(worst, SPOUSE));
  assert.equal(spouse.undecided, false);
  assert.equal(spouse.spouseRatio, 85);
  assert.equal(spouse.selfRatio, 15);
  assert.equal(spouse.band, 'clear');

  // The mirror image must be exactly symmetric — a tool that leans toward
  // blaming the absent party would be worthless.
  const self = scoreFault(fault, answerAll(worst, SELF));
  assert.equal(self.selfRatio, 85);
  assert.equal(self.spouseRatio, 15);
});

test('both sides at fault reads as even', () => {
  const result = scoreFault(fault, answerAll(worst, BOTH));
  assert.equal(result.selfRatio, 50);
  assert.equal(result.spouseRatio, 50);
  assert.equal(result.band, 'even');
});

test('ratios are rounded to five and always total 100', () => {
  for (const dir of [SPOUSE, BOTH, SELF]) {
    for (const pick of [worst, (q) => Math.min(1, q.choices.length - 1)]) {
      const r = scoreFault(fault, answerAll(pick, dir));
      if (r.undecided) continue;
      assert.equal(r.selfRatio % 5, 0);
      assert.equal(r.selfRatio + r.spouseRatio, 100);
    }
  }
});

test('the safety answer is never scored but is reported', () => {
  const calm = answerAll(worst, SPOUSE);
  const flagged = { ...calm, [fault.safety.id]: 1 };
  const a = scoreFault(fault, calm);
  const b = scoreFault(fault, flagged);
  assert.equal(a.spouseRatio, b.spouseRatio, 'the safety answer must not move the split');
  assert.equal(a.safetyTriggered, false);
  assert.equal(b.safetyTriggered, true);
});

test('a reported threat is surfaced regardless of the split', () => {
  const answers = answerAll(best);
  const threat = fault.questions.find((q) => q.factor === 'FAULT_THREAT');
  answers[threat.id] = 1; // 한두 번 있었다 — scores 2
  answers[threat.direction.id] = SPOUSE;
  const result = scoreFault(fault, answers);
  assert.equal(result.threatReported, true);
  // Still below the reporting floor: one item cannot carry a ratio.
  assert.equal(result.undecided, true);
});

test('dimension breakdown splits the same way the total does', () => {
  const result = scoreFault(fault, answerAll(worst, SPOUSE));
  for (const dim of result.dims) {
    assert.equal(dim.self + dim.spouse, 100, `${dim.key}: the two sides must fill the dimension`);
    assert.ok(dim.spouse > dim.self, `${dim.key}: should lean the way the answers did`);
  }
});

test('an unanswered direction splits evenly rather than throwing', () => {
  const answers = { [fault.safety.id]: 0 };
  for (const q of fault.questions) answers[q.id] = worst(q);
  const result = scoreFault(fault, answers);
  assert.equal(result.selfRatio, 50);
});

test('the config refuses the machinery that only fits a risk index', () => {
  // Guards against someone copying a risk config and leaving these in: a fault
  // split has no logistic band, no flags, no typology.
  assert.equal('band' in fault, false);
  assert.equal('flags' in fault, false);
  assert.equal('types' in fault, false);
  assert.equal('interactions' in fault, false);
  assert.equal(fault.minReportable, 8);
});
