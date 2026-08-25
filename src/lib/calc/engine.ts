import { SAFETY_TRIGGER_INDEX } from './scales.ts';
import type {
  AnswerMap,
  CalcConfig,
  CalcResult,
  DimResult,
  FactorResult,
  Grade,
  InteractionResult,
  Perspective,
  Question,
  RiskFlag,
  TypeQuadrant,
} from './types.ts';

/**
 * Logistic mapping constants, identical for all six calculators.
 *
 * L/U keep the answer off both extremes on purpose. A perfect run never reads
 * 0% — no relationship carries a guarantee, and a 0% result would only ever be
 * screenshotted as a boast. The worst run never reads 100% either: a
 * self-assessment tool has no business telling anyone their marriage is over.
 * k and m put the steep part of the curve over the middle of the scale, where
 * most people land, so small differences there are actually visible.
 *
 * The simple and deep forms share these constants so that "screener said 42,
 * full test says 51" is a sentence a reader can interpret.
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

/** Total points available in one dimension. */
export function dimMax(config: CalcConfig, dim: string): number {
  return config.questions
    .filter((q) => q.dim === dim)
    .reduce((sum, q) => sum + maxScore(q), 0);
}

export function toGrade(index: number): Grade {
  return (GRADE_BANDS.find((b) => index <= b.max) ?? GRADE_BANDS[3]).grade;
}

/** S (0–100 composite) -> risk index (L–U). Exported for the fixture test. */
export function logistic(raw: number): number {
  return L + (U - L) / (1 + Math.exp(-K * (raw - M)));
}

/** Which FACTOR_COPY entry explains this question's answer. */
export function factorKey(q: Question): string {
  return q.factor ?? q.id;
}

function quadrant(config: CalcConfig, dims: DimResult[]): TypeQuadrant | undefined {
  const spec = config.types;
  if (!spec) return undefined;
  const read = (key: string) => dims.find((d) => d.key === key)?.effective ?? 0;
  const xHigh = read(spec.x.dim) >= spec.x.cut;
  const yHigh = read(spec.y.dim) >= spec.y.cut;
  if (!xHigh && !yHigh) return spec.quadrants.ll;
  if (xHigh && !yHigh) return spec.quadrants.hl;
  if (!xHigh && yHigh) return spec.quadrants.lh;
  return spec.quadrants.hh;
}

/**
 * Score a completed questionnaire. Pure: same answers, same result, no I/O.
 *
 * Unanswered questions count as zero. The UI requires every answer, so in
 * practice that only matters for a truncated sessionStorage payload.
 */
export function calcRiskIndex(config: CalcConfig, answers: AnswerMap): CalcResult {
  const dims: DimResult[] = [];
  const factors: FactorResult[] = [];

  for (const dim of config.dims) {
    const questions = config.questions.filter((q) => q.dim === dim.key);
    const total = questions.reduce((sum, q) => sum + maxScore(q), 0);
    let got = 0;

    for (const q of questions) {
      const picked = q.choices[answers[q.id] ?? -1];
      if (!picked) continue;
      got += picked.score;
      if (picked.score > 0 && dim.weight > 0) {
        factors.push({
          questionId: q.id,
          factorKey: factorKey(q),
          // Points this single answer adds to the composite. Summed over every
          // question these equal the linear part of S exactly, so "the answer
          // that raised your index most" means what it says.
          contribution: total === 0 ? 0 : (picked.score / total) * dim.weight * 100,
          answerLabel: picked.label,
        });
      }
    }

    const value = total === 0 ? 0 : Math.round((got / total) * 100);
    dims.push({
      key: dim.key,
      label: dim.label,
      weight: dim.weight,
      levelOnly: dim.levelOnly ?? false,
      note: dim.note,
      value,
      effective: value,
    });
  }

  // Mediation: commitment is partly what someone reports and partly what
  // satisfaction, alternatives and investment imply about it.
  if (config.mediation) {
    const target = dims.find((d) => d.key === config.mediation!.target);
    if (target) {
      const implied = config.mediation.sources.reduce((sum, src) => {
        const d = dims.find((x) => x.key === src.dim);
        return sum + (d ? d.value * src.weight : 0);
      }, 0);
      target.effective = Math.round(
        target.value * config.mediation.directWeight +
          implied * (1 - config.mediation.directWeight),
      );
    }
  }

  let raw = dims.reduce((sum, d) => sum + d.effective * d.weight, 0);

  const interactions: InteractionResult[] = (config.interactions ?? []).map((spec) => {
    const a = dims.find((d) => d.key === spec.a)?.effective ?? 0;
    const b = dims.find((d) => d.key === spec.b)?.effective ?? 0;
    const value = (a * b) / 100;
    const contribution = value * spec.weight;
    raw += contribution;
    return {
      key: spec.key,
      label: spec.label,
      note: spec.note,
      weight: spec.weight,
      value: Math.round(value),
      contribution,
    };
  });

  const indexBeforeFlag = Math.round(logistic(raw));

  // Risk flags raise a floor; they never lower anything. When several fire,
  // only the highest floor applies.
  let flag: RiskFlag | undefined;
  for (const spec of config.flags ?? []) {
    const picked = answers[spec.questionId];
    if (typeof picked !== 'number' || picked < spec.minChoiceIndex) continue;
    if (!flag || spec.floor > flag.floor) flag = spec;
  }
  const index = flag ? Math.min(U, Math.max(indexBeforeFlag, flag.floor)) : indexBeforeFlag;

  const safetyAnswer = config.safety ? answers[config.safety.id] : undefined;

  return {
    raw,
    index,
    indexBeforeFlag,
    grade: toGrade(index),
    dims,
    interactions,
    topFactors: factors.sort((a, b) => b.contribution - a.contribution).slice(0, 3),
    flag: flag && index > indexBeforeFlag ? flag : undefined,
    type: quadrant(config, dims),
    safetyTriggered: safetyAnswer === SAFETY_TRIGGER_INDEX,
    band: config.band,
  };
}

/** Swap {상대}/{배우자} for the noun matching the chosen perspective. */
export function withPronoun(text: string, config: CalcConfig, p: Perspective): string {
  return text.replace(/\{(?:상대|배우자)\}/g, config.pronoun[p]);
}

/** Every scored question, plus the safety question when the config has one. */
export function allQuestions(config: CalcConfig): Question[] {
  return config.safety ? [config.safety, ...config.questions] : config.questions;
}

/** True once every scored question has an answer. */
export function isComplete(config: CalcConfig, answers: AnswerMap): boolean {
  return allQuestions(config).every((q) => typeof answers[q.id] === 'number');
}
