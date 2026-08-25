import type { Choice } from './types.ts';

/**
 * Shared response scales.
 *
 * Two design decisions live here. First, frequency and agreement items use a
 * five-point scale rather than four bespoke sentences: it carries more
 * information, reads faster, and gives the respondent nothing to infer a
 * "right answer" from. Second, reverse scoring is data, not logic — a
 * reverse-keyed item simply carries the reversed score array, so the engine
 * never needs to know the difference.
 *
 * Roughly half the agreement items are worded positively (agreeing means the
 * relationship is doing well). Without that, every item points the same way
 * and a respondent can run a straight line down one side of the scale.
 */

const freq = (labels: string[]): Choice[] =>
  labels.map((label, i) => ({ label, score: i }));

/** F — negative behaviour, "지난 한 달 동안". More often is worse. */
export const F: Choice[] = freq([
  '없었다',
  '한두 번 있었다',
  '일주일에 한 번쯤',
  '일주일에 두세 번',
  '거의 매일',
]);

/** F3 — negative behaviour over a longer window, "지난 세 달 동안". */
export const F3: Choice[] = freq([
  '없었다',
  '한두 번 있었다',
  '한 달에 한두 번',
  '일주일에 한 번쯤',
  '그보다 자주',
]);

/** P — positive behaviour, "지난 한 달 동안". Less often is worse. */
export const P: Choice[] = freq([
  '거의 매일',
  '일주일에 두세 번',
  '일주일에 한 번쯤',
  '한두 번 있었다',
  '없었다',
]);

const AGREE = ['전혀 그렇지 않다', '그렇지 않은 편이다', '반반이다', '그런 편이다', '매우 그렇다'];

/** A — agreement with a statement where agreeing means more risk. */
export const A: Choice[] = AGREE.map((label, i) => ({ label, score: i }));

/** AR — same labels, reverse keyed: agreeing means less risk. */
export const AR: Choice[] = AGREE.map((label, i) => ({ label, score: 4 - i }));

/** Scene questions carry their own options; this just keeps them terse. */
export const scene = (...pairs: Array<[string, number]>): Choice[] =>
  pairs.map(([label, score]) => ({ label, score }));

/**
 * The safety question shown before scoring starts on every deep calculator.
 * Never scored, never stored, never shared — it exists only to put a help
 * banner in front of someone this instrument cannot serve.
 */
export const SAFETY_QUESTION = {
  id: 'S0',
  dim: 'safety',
  step: 0,
  text: '지난 일 년 사이, 관계에서 다음 중 겪은 것이 있나요? — 신체적 위협이나 폭력 / 행동·연락·돈에 대한 일방적 통제 / 반복적인 모욕과 위협',
  choices: scene(['없다', 0], ['있다', 0], ['답하고 싶지 않다', 0]),
};

/** The index of the answer that raises the safety banner. */
export const SAFETY_TRIGGER_INDEX = 1;
