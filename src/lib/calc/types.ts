/**
 * Shared types for the three relationship-risk calculators.
 *
 * The scoring model lives entirely in data: every question, choice, score and
 * axis weight is a plain object here, so the model can be tuned without
 * touching the engine. The engine (engine.ts) is a pure function over these.
 */

export type CalcType = 'breakup' | 'divorce' | 'twilight';

/** Which side the respondent is answering from. Affects wording only — never score. */
export type Perspective = 'm' | 'f' | 'na';

export type AxisKey =
  | 'behavior' // 관계 행동/정서
  | 'structure' // 구조/환경
  | 'economy' // 경제/현실
  | 'trust' // 신뢰
  | 'outlook' // 전망
  | 'later'; // 황혼 전용 (은퇴·돌봄·역할)

export type Grade = 'stable' | 'check' | 'caution' | 'warning';

export interface Choice {
  /** Copy shown on the radio label. */
  label: string;
  /** Raw points. A question's highest choice score is its weight inside its axis. */
  score: number;
}

export interface Question {
  /** Stable id ('A1'…). Persisted in shared results, so never renumber. */
  id: string;
  axis: AxisKey;
  /** 1-based step this question belongs to. */
  step: number;
  /** May contain {상대} / {배우자}, replaced by the perspective's noun. */
  text: string;
  choices: Choice[];
}

export interface AxisDef {
  key: AxisKey;
  label: string;
  /** Share of the composite score. Weights within a config sum to 1. */
  weight: number;
}

export interface StepDef {
  title: string;
  /** Small line under the step title while answering. */
  caption: string;
}

export interface CalcConfig {
  type: CalcType;
  /** URL segment: /breakup, /divorce, /twilight. */
  path: string;
  /** Short name used in headings and share copy. */
  name: string;
  /** Full page title copy. */
  title: string;
  intro: string;
  /** The noun that replaces {상대}/{배우자} per perspective. */
  pronoun: Record<Perspective, string>;
  steps: StepDef[];
  axes: AxisDef[];
  questions: Question[];
}

/** questionId -> chosen choice index. */
export type AnswerMap = Record<string, number>;

export interface AxisResult {
  key: AxisKey;
  label: string;
  weight: number;
  /** 0–100, this axis on its own. */
  value: number;
}

export interface FactorResult {
  questionId: string;
  /** Points this answer contributed to the composite score S. */
  contribution: number;
  /** The choice the user picked, for echoing back on the result page. */
  answerLabel: string;
}

export interface CalcResult {
  /** Composite 0–100 before the logistic squeeze. */
  raw: number;
  /** Risk index, 5–85, rounded. This is the number shown to the user. */
  index: number;
  grade: Grade;
  axes: AxisResult[];
  /** Highest-contributing answers, descending. Empty when nothing scored. */
  topFactors: FactorResult[];
}
