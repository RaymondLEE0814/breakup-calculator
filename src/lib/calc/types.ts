/**
 * Shared types for the six relationship-risk calculators.
 *
 * The scoring model lives entirely in data: every question, choice, score,
 * dimension weight, interaction term and risk flag is a plain object, so the
 * model can be tuned without touching the engine. The engine (engine.ts) is a
 * pure function over these.
 *
 * v2 (2026-08-25) replaced the v1 model. What changed and why is in
 * docs/PLAN-V2.md; the short version is that v1 measured four convenience
 * categories with transparent items, and v2 measures constructs that
 * relationship research actually predicts on — satisfaction, quality of
 * alternatives, investment, dedication, constraint, conflict process,
 * attachment, external stress, and how far someone has already moved toward
 * leaving.
 */

/** Which of the three life stages a calculator serves. */
export type Family = 'breakup' | 'divorce' | 'twilight';

/** simple = 60-second screener, deep = 7-10 minute profile. */
export type Depth = 'simple' | 'deep';

/**
 * Stable calculator id, persisted in shared results.
 *
 * The simple forms keep the bare family ids the v1 calculators used, because
 * they occupy the same URLs and serve the same search intent. Old rows are
 * told apart by model_version, not by a new id.
 */
export type CalcType =
  | 'breakup'
  | 'divorce'
  | 'twilight'
  | 'breakup-deep'
  | 'divorce-deep'
  | 'twilight-deep';

/** Which side the respondent answers from. Affects wording only — never score. */
export type Perspective = 'm' | 'f' | 'na';

/**
 * Dimension key. Free-form by design: six calculators draw on different
 * theoretical frames and a closed union would fight every tuning pass. The
 * test suite enforces that every question's dimension is declared by its
 * config, which is the invariant that actually matters.
 */
export type DimKey = string;

export type Grade = 'stable' | 'check' | 'caution' | 'warning';

export interface Choice {
  /** Copy shown on the option. */
  label: string;
  /** 0–4. Reverse-scored items simply carry a reversed score array. */
  score: number;
}

export interface Question {
  /** Stable id ('BD19'…). Persisted in shared results, so never renumber. */
  id: string;
  dim: DimKey;
  /** 1-based step this question belongs to. */
  step: number;
  /** May contain {상대} / {배우자}, replaced by the perspective's noun. */
  text: string;
  choices: Choice[];
  /**
   * Which entry in FACTOR_COPY explains this answer on the result page.
   * Defaults to the question id. Most v2 questions measure a construct that
   * recurs across calculators — contempt is contempt whether it is said to a
   * boyfriend or to a husband of thirty years — so they share one entry
   * rather than repeating near-identical copy 120 times.
   */
  factor?: string;
}

export interface DimDef {
  key: DimKey;
  label: string;
  /** Share of the composite score. Weights + interaction weights sum to 1. */
  weight: number;
  /**
   * Shown on the profile but excluded from the weighted sum (weight 0).
   * Constraint is the case this exists for: being held in place by children,
   * money or other people's opinions is not a risk on its own — it is only a
   * risk when dedication is low, which the interaction term captures.
   */
  levelOnly?: boolean;
  /** One line under the bar on the deep result page. */
  note?: string;
}

export interface StepDef {
  title: string;
  caption: string;
}

/**
 * Investment-model mediation: satisfaction, alternatives and investment act on
 * stability *through* commitment. The target dimension's effective score is a
 * blend of what was measured directly and what the model predicts from its
 * inputs.
 */
export interface Mediation {
  target: DimKey;
  /** Weight given to the directly measured score; the rest goes to sources. */
  directWeight: number;
  sources: Array<{ dim: DimKey; weight: number }>;
}

/**
 * A multiplicative term: value = D_a × D_b / 100.
 *
 * Linear sums cannot say "high pressure only matters when coping is poor", or
 * "constraint is only dangerous when dedication is gone". These can.
 */
export interface Interaction {
  key: string;
  label: string;
  a: DimKey;
  b: DimKey;
  weight: number;
  /** Shown on the result page when the term contributes meaningfully. */
  note: string;
}

/**
 * A floor the index cannot fall below once a given answer is chosen.
 *
 * Behavioural steps toward separation — telling a partner, consulting a
 * lawyer — predict outcomes strongly enough that a gentle score everywhere
 * else must not wash them out.
 */
export interface RiskFlag {
  questionId: string;
  /** Choosing this index or any later one triggers the flag. */
  minChoiceIndex: number;
  floor: number;
  /** Shown on the result page so a raised index is never unexplained. */
  note: string;
}

/** A 2×2 profile type, e.g. satisfaction × dedication. */
export interface TypeQuadrant {
  code: string;
  name: string;
  body: string;
}

export interface TypeSpec {
  /** Dimension on the horizontal axis, and the cut that splits it. */
  x: { dim: DimKey; label: string; cut: number };
  y: { dim: DimKey; label: string; cut: number };
  /** Keyed low/high on x then low/high on y, where "low" means low risk. */
  quadrants: {
    ll: TypeQuadrant;
    hl: TypeQuadrant;
    lh: TypeQuadrant;
    hh: TypeQuadrant;
  };
}

export interface CalcConfig {
  type: CalcType;
  family: Family;
  depth: Depth;
  /** 2 for every calculator in this file; 1 rows exist only in the database. */
  modelVersion: 2;
  /** URL of this calculator. */
  path: string;
  /** Short name used in headings and share copy. */
  name: string;
  title: string;
  intro: string;
  /** Minutes, shown on cards and intros. */
  minutes: string;
  pronoun: Record<Perspective, string>;
  steps: StepDef[];
  dims: DimDef[];
  questions: Question[];
  /**
   * Honest width of the estimate, in index points. Screeners get a band
   * because seven items cannot support a point estimate.
   */
  band?: number;
  mediation?: Mediation;
  interactions?: Interaction[];
  flags?: RiskFlag[];
  types?: TypeSpec;
  /**
   * Asked before scoring begins and never scored, stored or shared. Its only
   * job is to put a help banner on the result page — this instrument cannot
   * describe a relationship with violence or coercive control in it.
   */
  safety?: Question;
}

/**
 * A fault question asks the same event twice: how far it went, and which side
 * it came from. The direction half only appears when the degree half scored
 * above zero — there is no point asking who was responsible for something that
 * never happened.
 */
export interface DirectionChoice {
  label: string;
  /** Share of this question's points attributed to the respondent, 0–1. */
  selfShare: number;
}

export interface DirectionQuestion {
  id: string;
  text: string;
  choices: DirectionChoice[];
}

export interface FaultQuestion extends Question {
  direction: DirectionQuestion;
}

/**
 * The fault calculator is not a risk calculator. It shares the question and
 * dimension machinery, but it produces a split between two people rather than
 * an index, so the terms that only make sense for a risk index — mediation,
 * interaction, flags, typology, the logistic band — are omitted outright.
 */
export interface FaultConfig
  extends Omit<
    CalcConfig,
    'type' | 'questions' | 'mediation' | 'interactions' | 'flags' | 'types' | 'band'
  > {
  type: 'fault';
  questions: FaultQuestion[];
  /**
   * Below this combined score the split is not reported. A ratio between two
   * near-zero numbers is noise, and printing it would invite a fight over
   * nothing.
   */
  minReportable: number;
}

export interface FaultSideDim {
  key: DimKey;
  label: string;
  weight: number;
  /** 0–100 for each side. */
  self: number;
  spouse: number;
}

export interface FaultResult {
  /** Weighted 0–100 per side. */
  selfScore: number;
  spouseScore: number;
  /** Percent of the reported fault, rounded to 5, or null when not reportable. */
  selfRatio: number | null;
  spouseRatio: number | null;
  /** True when too little was reported to split anything. */
  undecided: boolean;
  /** One of 'even' | 'leaning' | 'clear' | 'lopsided', or null when undecided. */
  band: 'even' | 'leaning' | 'clear' | 'lopsided' | null;
  dims: FaultSideDim[];
  safetyTriggered: boolean;
  /** True when a threat item was answered at 2 or above. */
  threatReported: boolean;
}

/** questionId -> chosen choice index. */
export type AnswerMap = Record<string, number>;

export interface DimResult {
  key: DimKey;
  label: string;
  weight: number;
  levelOnly: boolean;
  note?: string;
  /** 0–100 as measured. */
  value: number;
  /** 0–100 after mediation, when the config mediates this dimension. */
  effective: number;
}

export interface InteractionResult {
  key: string;
  label: string;
  note: string;
  weight: number;
  /** 0–100. */
  value: number;
  /** Points this term added to the composite score. */
  contribution: number;
}

export interface FactorResult {
  questionId: string;
  factorKey: string;
  /** Points this answer contributed to the composite score. */
  contribution: number;
  answerLabel: string;
}

export interface CalcResult {
  /** Composite 0–100 before the logistic squeeze. */
  raw: number;
  /** Risk index, 5–85, rounded. This is the number shown to the user. */
  index: number;
  /** The index before any risk flag raised it. */
  indexBeforeFlag: number;
  grade: Grade;
  dims: DimResult[];
  interactions: InteractionResult[];
  /** Highest-contributing answers, descending. Empty when nothing scored. */
  topFactors: FactorResult[];
  /** The flag that raised the index, when one did. */
  flag?: RiskFlag;
  /** The 2×2 quadrant this profile lands in, for deep calculators. */
  type?: TypeQuadrant;
  /** True when the safety question reported violence or coercive control. */
  safetyTriggered: boolean;
  band?: number;
}
