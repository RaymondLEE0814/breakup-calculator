import { AR, F, scene } from './scales.ts';
import type { CalcConfig } from './types.ts';

/**
 * 부부 심플형 — 60초 선별 검사. 7문항.
 *
 * A three-item satisfaction core, the two interaction patterns with the
 * strongest predictive record, one dedication item, and the behavioural step
 * question. The last one earns its place outright: how far someone has
 * already moved toward divorce predicts better than almost anything else you
 * can ask in seven items, so it also carries a floor.
 */
export const divorce: CalcConfig = {
  type: 'divorce',
  family: 'divorce',
  depth: 'simple',
  modelVersion: 2,
  path: '/divorce/quick',
  name: '이혼 확률 계산기',
  title: '이혼 확률 계산기',
  minutes: '약 1분',
  intro:
    '일곱 개의 질문으로 지금 결혼 생활의 위험 신호를 빠르게 살펴봅니다. 1분이면 됩니다. 이것은 빠른 선별 검사입니다 — 더 자세한 구조는 심화 검사에서 나눠 봅니다.',
  pronoun: { m: '아내', f: '남편', na: '배우자' },
  band: 7,
  steps: [{ title: '일곱 가지', caption: '떠오르는 대로 답하시면 됩니다.' }],
  dims: [
    { key: 'SAT', label: '결혼 만족', weight: 0.35 },
    { key: 'INT', label: '오가는 말', weight: 0.3 },
    { key: 'DED', label: '함께할 마음', weight: 0.15 },
    { key: 'DIS', label: '이혼을 향한 걸음', weight: 0.2 },
  ],
  flags: [
    {
      questionId: 'DS7',
      minChoiceIndex: 2,
      floor: 50,
      note: '이혼이나 별거를 실제로 입 밖에 낸 적이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 말이 되어 나온 이혼은 생각에 머물던 이혼과 다른 단계입니다.',
    },
    {
      questionId: 'DS7',
      minChoiceIndex: 3,
      floor: 60,
      note: '별거 중이거나 절차를 알아본 적이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 이미 실행의 영역에 들어와 있기 때문입니다.',
    },
  ],
  questions: [
    {
      id: 'DS1',
      dim: 'SAT',
      step: 1,
      factor: 'SATISFACTION',
      text: '결혼 생활 전반에 대해, 나는 만족한다.',
      choices: AR,
    },
    {
      id: 'DS2',
      dim: 'SAT',
      step: 1,
      factor: 'SPOUSE_SATISFACTION',
      text: '{배우자}는 나에게 좋은 배우자다.',
      choices: AR,
    },
    {
      id: 'DS3',
      dim: 'INT',
      step: 1,
      factor: 'CON_TALKVOLUME',
      text: '요즘 두 사람의 일상 대화를 떠올리면?',
      choices: scene(
        ['필요한 말도, 시시한 잡담도 다 있다', 0],
        ['필요한 말은 하지만 잡담은 줄었다', 1],
        ['용건이 아니면 대화가 거의 없다', 3],
        ['용건조차 문자나 아이를 통해 전할 때가 있다', 4],
      ),
    },
    {
      id: 'DS4',
      dim: 'INT',
      step: 1,
      factor: 'CON_CONTEMPT',
      text: '지난 한 달 동안, 상대를 깎아내리는 말이나 무시하는 말투가 — 어느 쪽에서든 — 나온 적이 있었나요?',
      choices: F,
    },
    {
      id: 'DS5',
      dim: 'INT',
      step: 1,
      factor: 'CON_WITHDRAW',
      text: '지난 한 달 동안, 한 사람이 문제를 꺼내면 다른 한 사람이 입을 닫거나 자리를 피하는 일이 있었나요?',
      choices: F,
    },
    {
      id: 'DS6',
      dim: 'DED',
      step: 1,
      factor: 'DED_LONGVIEW',
      text: '10년 뒤에도 이 사람 옆에 있는 내 모습이, 자연스럽게 그려진다.',
      choices: AR,
    },
    {
      id: 'DS7',
      dim: 'DIS',
      step: 1,
      factor: 'MSI_STEP',
      text: '이혼에 대해, 어디까지 가 봤나요?',
      choices: scene(
        ['진지하게 생각해 본 적 없다', 0],
        ['생각해 본 적은 있다', 1],
        ['{배우자}와 이혼이나 별거 이야기를 꺼낸 적 있다', 3],
        ['별거 중이거나, 절차·재산 문제를 구체적으로 알아본 적 있다', 4],
      ),
    },
  ],
};
