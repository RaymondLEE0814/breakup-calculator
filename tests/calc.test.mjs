import { test } from 'node:test';
import assert from 'node:assert/strict';

import { breakup } from '../src/lib/calc/breakup.ts';
import { breakupDeep } from '../src/lib/calc/breakup-deep.ts';
import { divorce } from '../src/lib/calc/divorce.ts';
import { divorceDeep } from '../src/lib/calc/divorce-deep.ts';
import { twilight } from '../src/lib/calc/twilight.ts';
import { twilightDeep } from '../src/lib/calc/twilight-deep.ts';
import { calcRiskIndex, factorKey, logistic, maxScore, toGrade } from '../src/lib/calc/engine.ts';
import { FACTOR_COPY } from '../src/lib/calc/factors.ts';

const CONFIGS = [breakup, breakupDeep, divorce, divorceDeep, twilight, twilightDeep];
const SIMPLE = [breakup, divorce, twilight];
const DEEP = [breakupDeep, divorceDeep, twilightDeep];

/** Answer every scored question with the choice the selector picks. */
function answerAll(config, pick) {
  const answers = {};
  for (const q of config.questions) answers[q.id] = pick(q);
  if (config.safety) answers[config.safety.id] = 0;
  return answers;
}

const bestIndex = (q) =>
  q.choices.reduce((best, c, i) => (c.score < q.choices[best].score ? i : best), 0);
const worstIndex = (q) =>
  q.choices.reduce((worst, c, i) => (c.score > q.choices[worst].score ? i : worst), 0);

test('logistic curve matches the specified reference points', () => {
  // S -> R, the mapping every calculator is specified on. Locking these means
  // the curve cannot drift without someone deliberately updating the spec.
  const expected = [
    [0, 8.3],
    [25, 20.8],
    [45, 45.0],
    [65, 69.2],
    [85, 80.4],
    [100, 83.3],
  ];
  for (const [raw, r] of expected) {
    assert.ok(
      Math.abs(logistic(raw) - r) < 0.05,
      `S=${raw} expected ~${r}, got ${logistic(raw).toFixed(2)}`,
    );
  }
});

test('every calculator spans the full 8-83 range and no further', () => {
  for (const config of CONFIGS) {
    const best = calcRiskIndex(config, answerAll(config, bestIndex));
    const worst = calcRiskIndex(config, answerAll(config, worstIndex));

    // v2 dropped the tenure questions that used to put a floor under the best
    // case, so a clean run now reaches the true floor of the curve.
    assert.equal(best.index, 8, `${config.type}: best case`);
    assert.equal(worst.index, 83, `${config.type}: worst case`);
    assert.equal(best.grade, 'stable', `${config.type}: best grade`);
    assert.equal(worst.grade, 'warning', `${config.type}: worst grade`);
    assert.ok(worst.index <= 85, `${config.type}: never exceeds the ceiling`);
  }
});

test('best case scores zero on every dimension, worst case 100', () => {
  for (const config of CONFIGS) {
    const best = calcRiskIndex(config, answerAll(config, bestIndex));
    const worst = calcRiskIndex(config, answerAll(config, worstIndex));
    for (const d of best.dims) assert.equal(d.value, 0, `${config.type}/${d.key} best`);
    for (const d of worst.dims) assert.equal(d.value, 100, `${config.type}/${d.key} worst`);
    // Mediation and interaction terms must respect the same bounds.
    for (const d of worst.dims) assert.equal(d.effective, 100, `${config.type}/${d.key} effective`);
    for (const i of worst.interactions) assert.equal(i.value, 100, `${config.type}/${i.key}`);
  }
});

test('dimension weights and interaction weights sum to exactly 1', () => {
  for (const config of CONFIGS) {
    const dimSum = config.dims.reduce((s, d) => s + d.weight, 0);
    const interSum = (config.interactions ?? []).reduce((s, i) => s + i.weight, 0);
    const total = dimSum + interSum;
    assert.ok(
      Math.abs(total - 1) < 1e-9,
      `${config.type}: weights sum to ${total.toFixed(4)}, not 1`,
    );
  }
});

test('level-only dimensions carry no direct weight but do have questions', () => {
  for (const config of CONFIGS) {
    for (const dim of config.dims) {
      const questions = config.questions.filter((q) => q.dim === dim.key);
      assert.ok(questions.length > 0, `${config.type}: dimension ${dim.key} has no questions`);
      if (dim.levelOnly) {
        assert.equal(dim.weight, 0, `${config.type}/${dim.key}: level-only must not carry weight`);
      }
    }
    const declared = new Set(config.dims.map((d) => d.key));
    for (const q of config.questions) {
      assert.ok(declared.has(q.dim), `${config.type}/${q.id}: dimension ${q.dim} is not declared`);
    }
  }
});

test('constraint is only ever a risk through the interaction term', () => {
  // The whole point of separating dedication from constraint: heavy
  // constraints with high dedication is a settled marriage, not a failing one.
  for (const config of [divorceDeep, twilightDeep]) {
    const answers = answerAll(config, bestIndex);
    for (const q of config.questions.filter((x) => x.dim === 'CNS')) {
      answers[q.id] = worstIndex(q);
    }
    const result = calcRiskIndex(config, answers);
    const cns = result.dims.find((d) => d.key === 'CNS');
    assert.equal(cns.value, 100, `${config.type}: constraint should read at its maximum`);
    // Dedication is at its best, so G = 0 and the index must not move.
    assert.equal(result.index, 8, `${config.type}: constraint alone must not raise the index`);
  }
});

test('constraint plus lost dedication does raise the index', () => {
  for (const config of [divorceDeep, twilightDeep]) {
    const withDedication = answerAll(config, bestIndex);
    const withoutDedication = answerAll(config, bestIndex);
    for (const q of config.questions.filter((x) => x.dim === 'CNS')) {
      withDedication[q.id] = worstIndex(q);
      withoutDedication[q.id] = worstIndex(q);
    }
    for (const q of config.questions.filter((x) => x.dim === 'DED')) {
      withoutDedication[q.id] = worstIndex(q);
    }
    const a = calcRiskIndex(config, withDedication);
    const b = calcRiskIndex(config, withoutDedication);
    assert.ok(b.index > a.index, `${config.type}: the gap term must bite`);
    const g = b.interactions.find((i) => i.key === 'G');
    assert.equal(g.value, 100, `${config.type}: G should be at its maximum`);
  }
});

test('the stress interaction only fires when both sides are high', () => {
  const config = divorceDeep;
  const stressOnly = answerAll(config, bestIndex);
  for (const q of config.questions.filter((x) => x.dim === 'STR')) {
    stressOnly[q.id] = worstIndex(q);
  }
  const result = calcRiskIndex(config, stressOnly);
  const i = result.interactions.find((x) => x.key === 'I');
  // Adaptation is clean, so pressure alone contributes nothing multiplicative.
  assert.equal(i.value, 0);
});

test('investment-model mediation moves commitment toward its inputs', () => {
  const config = breakupDeep;
  // Report high commitment while satisfaction, alternatives and investment all
  // say otherwise. The mediated score must land between the two stories.
  const answers = answerAll(config, bestIndex);
  for (const q of config.questions.filter((x) => ['SAT', 'ALT', 'INV'].includes(x.dim))) {
    answers[q.id] = worstIndex(q);
  }
  const result = calcRiskIndex(config, answers);
  const ded = result.dims.find((d) => d.key === 'DED');
  assert.equal(ded.value, 0, 'reported commitment is at its best');
  assert.equal(ded.effective, 50, 'mediated commitment splits the difference');
});

test('risk flags raise the floor and are reported', () => {
  const cases = [
    [breakup, 'BS7', 3, 45],
    [divorce, 'DS7', 2, 50],
    [divorce, 'DS7', 3, 60],
    [twilight, 'TS7', 3, 60],
    [breakupDeep, 'BD33', 2, 40],
    [breakupDeep, 'BD33', 3, 52],
    [divorceDeep, 'DD34', 3, 65],
    [twilightDeep, 'TD32', 3, 65],
  ];
  for (const [config, questionId, choice, floor] of cases) {
    const answers = answerAll(config, bestIndex);
    answers[questionId] = choice;
    const result = calcRiskIndex(config, answers);
    assert.equal(result.index, floor, `${config.type}/${questionId}=${choice}`);
    assert.ok(result.flag, `${config.type}/${questionId}: flag must be reported`);
    assert.ok(result.flag.note.length > 10, 'a raised index is never unexplained');
    assert.ok(result.indexBeforeFlag < floor, 'the flag is what raised it');
  }
});

test('a flag never lowers an index that is already higher', () => {
  const answers = answerAll(divorceDeep, worstIndex);
  const result = calcRiskIndex(divorceDeep, answers);
  assert.equal(result.index, 83);
  assert.equal(result.flag, undefined, 'no flag is credited when it changed nothing');
});

test('every question has result copy, sane choices and a valid step', () => {
  for (const config of CONFIGS) {
    for (const q of config.questions) {
      const key = factorKey(q);
      assert.ok(FACTOR_COPY[key], `${config.type}/${q.id}: no factor copy for "${key}"`);
      assert.ok(q.choices.length >= 2, `${q.id} needs at least two choices`);
      for (const c of q.choices) {
        assert.ok(c.score >= 0 && c.score <= 4, `${q.id}: score out of the 0-4 range`);
        assert.ok(c.label.length > 0, `${q.id}: empty choice label`);
      }
      assert.ok(
        q.choices.some((c) => c.score === 0),
        `${q.id}: every question must be answerable without penalty`,
      );
      assert.equal(maxScore(q), 4, `${q.id}: every question should top out at 4`);
      assert.ok(q.step >= 1 && q.step <= config.steps.length, `${q.id}: step out of range`);
    }
  }
});

test('question ids are unique across all six calculators', () => {
  const seen = new Set();
  for (const config of CONFIGS) {
    for (const q of config.questions) {
      assert.ok(!seen.has(q.id), `duplicate question id ${q.id}`);
      seen.add(q.id);
    }
  }
});

test('no v2 question reuses a v1 question id', () => {
  // v1 ids live on inside shared results; reusing one would make an old link
  // render someone else's answer.
  const legacy = /^[ABC]\d+$/;
  for (const config of CONFIGS) {
    for (const q of config.questions) {
      assert.ok(!legacy.test(q.id), `${q.id} collides with a retired v1 id`);
    }
  }
});

test('screeners are short and banded, deep dives are long and typed', () => {
  for (const config of SIMPLE) {
    assert.ok(config.questions.length <= 8, `${config.type}: a screener must stay short`);
    assert.equal(config.band, 7, `${config.type}: screeners publish their uncertainty`);
    assert.equal(config.safety, undefined, 'the safety gate belongs to the deep dives');
    assert.equal(config.types, undefined, 'seven items cannot support a typology');
  }
  for (const config of DEEP) {
    assert.ok(config.questions.length >= 28, `${config.type}: a deep dive needs depth`);
    assert.ok(config.safety, `${config.type}: deep dives must gate for safety`);
    assert.ok(config.types, `${config.type}: deep dives produce a type`);
    assert.equal(config.band, undefined, 'a 30-item instrument reports a point');
  }
});

test('every deep calculator reaches all four quadrants', () => {
  for (const config of DEEP) {
    const spec = config.types;
    const seen = new Set();
    for (const xWorst of [false, true]) {
      for (const yWorst of [false, true]) {
        const answers = answerAll(config, bestIndex);
        for (const q of config.questions) {
          if (xWorst && q.dim === spec.x.dim) answers[q.id] = worstIndex(q);
          if (yWorst && q.dim === spec.y.dim) answers[q.id] = worstIndex(q);
        }
        const result = calcRiskIndex(config, answers);
        assert.ok(result.type, `${config.type}: a type must always be assigned`);
        seen.add(result.type.code);
      }
    }
    assert.equal(seen.size, 4, `${config.type}: expected four distinct types, got ${seen.size}`);
  }
});

test('the safety question is never scored', () => {
  for (const config of DEEP) {
    const calm = answerAll(config, bestIndex);
    const flagged = { ...calm, [config.safety.id]: 1 };
    const a = calcRiskIndex(config, calm);
    const b = calcRiskIndex(config, flagged);
    assert.equal(a.index, b.index, `${config.type}: the safety answer must not move the index`);
    assert.equal(a.safetyTriggered, false);
    assert.equal(b.safetyTriggered, true);
  }
});

test('top factors are ordered and drawn from weighted dimensions only', () => {
  const config = breakupDeep;
  const answers = answerAll(config, bestIndex);
  answers.BD19 = 4; // contempt, at its worst
  const result = calcRiskIndex(config, answers);

  assert.equal(result.topFactors[0].questionId, 'BD19');
  assert.equal(result.topFactors[0].factorKey, 'CON_CONTEMPT');
  for (let i = 1; i < result.topFactors.length; i += 1) {
    assert.ok(result.topFactors[i - 1].contribution >= result.topFactors[i].contribution);
  }

  // MSI is flag-only on this config, so it must never appear as a top factor.
  const msiAnswers = answerAll(config, bestIndex);
  msiAnswers.BD33 = 3;
  const msiResult = calcRiskIndex(config, msiAnswers);
  assert.equal(msiResult.topFactors.length, 0, 'a zero-weight dimension contributes nothing');
});

test('grade bands cover the whole index range', () => {
  assert.equal(toGrade(5), 'stable');
  assert.equal(toGrade(29), 'stable');
  assert.equal(toGrade(30), 'check');
  assert.equal(toGrade(49), 'check');
  assert.equal(toGrade(50), 'caution');
  assert.equal(toGrade(67), 'caution');
  assert.equal(toGrade(68), 'warning');
  assert.equal(toGrade(85), 'warning');
});

test('a middling run lands in the middle of the scale', () => {
  // Answering "반반이다" / "한 달에 한두 번" everywhere should not read as
  // stable. A screener that calls a lukewarm relationship healthy is useless.
  for (const config of CONFIGS) {
    const answers = answerAll(config, (q) => Math.floor((q.choices.length - 1) / 2));
    const result = calcRiskIndex(config, answers);
    assert.ok(
      result.index >= 25 && result.index <= 60,
      `${config.type}: middling answers gave ${result.index}`,
    );
  }
});

test('partial answers do not throw and stay in range', () => {
  for (const config of CONFIGS) {
    const first = config.questions[0];
    const result = calcRiskIndex(config, { [first.id]: 1 });
    assert.ok(result.index >= 5 && result.index <= 85);
  }
});
