import type {
  AnswerMap,
  AxisResult,
  CalcConfig,
  CalcResult,
  FactorResult,
  Grade,
  Perspective,
  Question,
} from './types';

/**
 * Logistic mapping constants.
 *
 * L/U keep the answer off both extremes on purpose. A perfect run never reads
 * 0% — no relationship carries a guarantee, and a 0% result would only ever be
 * screenshotted as a boast. The worst run never reads 100% either: a
 * self-assessment tool has no business telling anyone their marriage is over.
 * k and m put the steep part of the curve over the middle of the scale, where
 * most people land, so small differences there are actually visible.
 */
export const L = 5;
export const U = 85;
export const K = 0.07;
export const M = 45;

/** Grade cut points, applied to the risk index. */
const GRADE_BANDS: Array<{ grade: Grade; max: number }> = [
  { grade: 'stable', max: 29 },
  { grade: 'check', max: 49 },
  { grade: 'caution', max: 67 },
  { grade: 'warning', max: Infinity },
];

export function maxScore(q: Question): number {
  return q.choices.reduce((hi, c) => Math.max(hi, c.score), 0);
}

/** Total points available in one axis. */
export function axisMax(config: CalcConfig, axis: string): number {
  return config.questions
    .filter((q) => q.axis === axis)
    .reduce((sum, q) => sum + maxScore(q), 0);
}

export function toGrade(index: number): Grade {
  return (GRADE_BANDS.find((b) => index <= b.max) ?? GRADE_BANDS[3]).grade;
}

/** S (0–100 composite) -> risk index (L–U). Exported for the fixture test. */
export function logistic(raw: number): number {
  return L + (U - L) / (1 + Math.exp(-K * (raw - M)));
}

/**
 * Score a completed questionnaire. Pure: same answers, same result, no I/O.
 * Unanswered questions count as zero, but the UI requires every answer, so in
 * practice this only matters for a truncated sessionStorage payload.
 */
export function calcRiskIndex(config: CalcConfig, answers: AnswerMap): CalcResult {
  const axes: AxisResult[] = [];
  const factors: FactorResult[] = [];

  for (const axis of config.axes) {
    const questions = config.questions.filter((q) => q.axis === axis.key);
    const total = questions.reduce((sum, q) => sum + maxScore(q), 0);
    let got = 0;

    for (const q of questions) {
      const picked = q.choices[answers[q.id] ?? -1];
      if (!picked) continue;
      got += picked.score;
      if (picked.score > 0) {
        factors.push({
          questionId: q.id,
          // Points this single answer adds to S. Summed over every question,
          // these equal S exactly, so "top factor" means what it says.
          contribution: total === 0 ? 0 : (picked.score / total) * axis.weight * 100,
          answerLabel: picked.label,
        });
      }
    }

    axes.push({
      key: axis.key,
      label: axis.label,
      weight: axis.weight,
      value: total === 0 ? 0 : Math.round((got / total) * 100),
    });
  }

  const raw = config.axes.reduce((sum, axis) => {
    const a = axes.find((x) => x.key === axis.key);
    return sum + (a ? a.value * axis.weight : 0);
  }, 0);

  const index = Math.round(logistic(raw));

  return {
    raw,
    index,
    grade: toGrade(index),
    axes,
    topFactors: factors.sort((a, b) => b.contribution - a.contribution).slice(0, 3),
  };
}

/** Swap {상대}/{배우자} for the noun matching the chosen perspective. */
export function withPronoun(text: string, config: CalcConfig, p: Perspective): string {
  return text.replace(/\{(?:상대|배우자)\}/g, config.pronoun[p]);
}

/** True once every question has an answer. */
export function isComplete(config: CalcConfig, answers: AnswerMap): boolean {
  return config.questions.every((q) => typeof answers[q.id] === 'number');
}
