import { test } from 'node:test';
import assert from 'node:assert/strict';

import { breakup } from '../src/lib/calc/breakup.ts';
import { divorce } from '../src/lib/calc/divorce.ts';
import { twilight } from '../src/lib/calc/twilight.ts';
import { calcRiskIndex, logistic, maxScore, toGrade } from '../src/lib/calc/engine.ts';
import { FACTOR_COPY } from '../src/lib/calc/factors.ts';

const CONFIGS = [breakup, divorce, twilight];

/** Pick the choice with the given selector for every question. */
function answerAll(config, pick) {
  const answers = {};
  for (const q of config.questions) {
    answers[q.id] = pick(q);
  }
  return answers;
}

const bestIndex = (q) => q.choices.reduce((best, c, i) => (c.score < q.choices[best].score ? i : best), 0);
const worstIndex = (q) => q.choices.reduce((worst, c, i) => (c.score > q.choices[worst].score ? i : worst), 0);

test('logistic curve matches the specified reference points', () => {
  // S -> R, the mapping the model is specified on. Locking these means the
  // curve cannot drift without someone deliberately updating the spec.
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

test('the index never reaches either extreme', () => {
  for (const config of CONFIGS) {
    const best = calcRiskIndex(config, answerAll(config, bestIndex));
    const worst = calcRiskIndex(config, answerAll(config, worstIndex));

    // 9, not 5: the duration questions carry a small floor by design — no
    // relationship scores a clean zero, and a 0% result would only ever be
    // screenshotted as a boast.
    assert.equal(best.index, 9, `${config.type}: best case`);
    assert.equal(worst.index, 83, `${config.type}: worst case`);
    assert.equal(best.grade, 'stable');
    assert.equal(worst.grade, 'warning');
  }
});

test('the best-case floor stays small on every axis', () => {
  for (const config of CONFIGS) {
    const best = calcRiskIndex(config, answerAll(config, bestIndex));
    const worst = calcRiskIndex(config, answerAll(config, worstIndex));

    for (const axis of best.axes) {
      // Only the structure axis has an unavoidable floor, and it must stay
      // low enough that it never drives the result on its own.
      assert.ok(axis.value <= 20, `${config.type}/${axis.key}: floor ${axis.value} is too high`);
    }
    for (const axis of worst.axes) assert.equal(axis.value, 100, `${config.type}/${axis.key}`);
  }
});

test('axis weights sum to 1 and every axis has questions', () => {
  for (const config of CONFIGS) {
    const sum = config.axes.reduce((s, a) => s + a.weight, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${config.type}: weights sum to ${sum}`);

    for (const axis of config.axes) {
      const qs = config.questions.filter((q) => q.axis === axis.key);
      assert.ok(qs.length > 0, `${config.type}: axis ${axis.key} has no questions`);
      assert.ok(
        qs.some((q) => maxScore(q) > 0),
        `${config.type}: axis ${axis.key} cannot score`,
      );
    }

    const axisKeys = new Set(config.axes.map((a) => a.key));
    for (const q of config.questions) {
      assert.ok(axisKeys.has(q.axis), `${config.type}/${q.id}: axis ${q.axis} is not declared`);
    }
  }
});

test('question ids are unique across all three calculators', () => {
  const seen = new Set();
  for (const config of CONFIGS) {
    for (const q of config.questions) {
      assert.ok(!seen.has(q.id), `duplicate question id ${q.id}`);
      seen.add(q.id);
    }
  }
});

test('every question has result copy and at least two choices', () => {
  for (const config of CONFIGS) {
    for (const q of config.questions) {
      assert.ok(FACTOR_COPY[q.id], `${q.id} has no factor copy`);
      assert.ok(q.choices.length >= 2, `${q.id} needs at least two choices`);
      for (const c of q.choices) assert.ok(c.score >= 0, `${q.id} has a negative score`);
      // A question may carry a floor (duration questions do), but never a big
      // one: an unavoidable answer must not dominate its axis.
      const floor = Math.min(...q.choices.map((c) => c.score));
      assert.ok(floor <= 3, `${q.id} floors at ${floor}, which is unavoidable and too heavy`);
      assert.ok(q.step >= 1 && q.step <= config.steps.length, `${q.id} has an out-of-range step`);
    }
  }
});

test('top factors are ordered and sum into the composite score', () => {
  const config = breakup;
  // A deliberately mixed run: contempt at its worst, everything else clean.
  const answers = answerAll(config, bestIndex);
  answers.A6 = 3; // 자주 있고, 익숙해졌다
  const result = calcRiskIndex(config, answers);

  // A1 still floors at 2 points, so contempt has to out-rank it, not stand alone.
  assert.equal(result.topFactors[0].questionId, 'A6');
  // 10 points out of the 44-point behaviour axis, at weight 0.50.
  assert.ok(Math.abs(result.topFactors[0].contribution - (10 / 44) * 50) < 1e-9);
  for (let i = 1; i < result.topFactors.length; i += 1) {
    assert.ok(
      result.topFactors[i - 1].contribution >= result.topFactors[i].contribution,
      'top factors must be sorted by contribution',
    );
  }
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

test('partial answers do not throw and stay in range', () => {
  const result = calcRiskIndex(breakup, { A1: 0, A6: 2 });
  assert.ok(result.index >= 5 && result.index <= 85);
});
