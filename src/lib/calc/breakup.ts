import { AR, F, scene } from './scales.ts';
import type { CalcConfig } from './types.ts';

/**
 * 연애 심플형 — 60초 선별 검사. 7문항.
 *
 * A screener, not a short version of the deep test. It carries only the
 * variables that predict hardest per item asked: a two-item satisfaction
 * core, quality of alternatives, commitment, the two interaction patterns
 * with the strongest track record (contempt and demand-withdraw), and how far
 * the person has already moved toward leaving.
 */
export const breakup: CalcConfig = {
  type: 'breakup',
  family: 'breakup',
  depth: 'simple',
  modelVersion: 2,
  path: '/breakup',
  name: '헤어질 확률 계산기',
  title: '헤어질 확률 계산기',
  minutes: '약 1분',
  intro:
    '일곱 개의 질문으로 지금 관계의 위험 신호를 빠르게 살펴봅니다. 1분이면 됩니다. 이것은 빠른 선별 검사입니다 — 더 자세한 구조는 심화 검사에서 나눠 봅니다.',
  pronoun: { m: '여자친구', f: '남자친구', na: '애인' },
  band: 7,
  steps: [{ title: '일곱 가지', caption: '떠오르는 대로 답하시면 됩니다.' }],
  dims: [
    { key: 'SAT', label: '만족', weight: 0.35 },
    { key: 'CMA', label: '헌신과 대안', weight: 0.3 },
    { key: 'NEG', label: '부딪히는 방식', weight: 0.25 },
    { key: 'DIS', label: '이별을 향한 걸음', weight: 0.1 },
  ],
  flags: [
    {
      questionId: 'BS7',
      minChoiceIndex: 3,
      floor: 45,
      note: '이별을 실제로 꺼낸 적이 있다는 응답은, 다른 응답이 온화하더라도 지수를 끌어올립니다. 말로 나온 이별은 되돌아가더라도 관계에 자국을 남깁니다.',
    },
  ],
  questions: [
    {
      id: 'BS1',
      dim: 'SAT',
      step: 1,
      factor: 'SATISFACTION',
      text: '관계 전반을 놓고 보면, 나는 이 연애에 만족한다.',
      choices: AR,
    },
    {
      id: 'BS2',
      dim: 'SAT',
      step: 1,
      factor: 'COMFORT',
      text: '{상대}와 함께 있는 시간은 나에게 편안한 시간이다.',
      choices: AR,
    },
    {
      id: 'BS3',
      dim: 'CMA',
      step: 1,
      factor: 'ALT_IMAGINE',
      text: '헤어진 뒤의 내 생활을 상상해 보면?',
      choices: scene(
        ['상상이 잘 안 된다. 지금이 훨씬 낫다', 0],
        ['아쉽겠지만 시간이 지나면 괜찮아질 것 같다', 2],
        ['지금과 비슷하거나, 오히려 홀가분할 것 같다', 3],
        ['더 잘 맞는 사람을 만날 수 있겠다는 생각을 종종 한다', 4],
      ),
    },
    {
      id: 'BS4',
      dim: 'CMA',
      step: 1,
      factor: 'DED_LONGVIEW',
      text: '이 관계가 앞으로도 이어지기를 바라고, 실제로 그렇게 될 거라고 본다.',
      choices: AR,
    },
    {
      id: 'BS5',
      dim: 'NEG',
      step: 1,
      factor: 'CON_CONTEMPT',
      text: '지난 한 달 동안, 다툼 중에 비꼬는 말투나 비웃음, 한숨 섞인 무시가 — 내가 하든 {상대}가 하든 — 나온 적이 있었나요?',
      choices: F,
    },
    {
      id: 'BS6',
      dim: 'NEG',
      step: 1,
      factor: 'CON_WITHDRAW',
      text: '지난 한 달 동안, 한 사람이 서운한 이야기를 꺼내면 다른 한 사람이 대화를 피하거나 자리를 뜨는 일이 있었나요?',
      choices: F,
    },
    {
      id: 'BS7',
      dim: 'DIS',
      step: 1,
      factor: 'MSI_STEP',
      text: '이별에 대해, 어디까지 가 봤나요?',
      choices: scene(
        ['진지하게 생각해 본 적 없다', 0],
        ['혼자 생각해 본 적은 있다', 1],
        ['친구 등 다른 사람에게 진지하게 털어놓은 적 있다', 2],
        ['{상대}에게 이별을 꺼냈거나, 헤어졌다 다시 만난 적이 있다', 4],
      ),
    },
  ],
};
