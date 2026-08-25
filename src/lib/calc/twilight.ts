import { AR, F, scene } from './scales.ts';
import type { CalcConfig } from './types.ts';

/**
 * 황혼 심플형 — 60초 선별 검사. 7문항.
 *
 * The question that carries this screener is TS5: what has been holding this
 * marriage together. For a couple of thirty years, "we are still married" is
 * a record of duration, not evidence of stability — and a marriage held up by
 * children, appearances or the lack of an exit is a different object from one
 * held up by wanting to be there.
 */
export const twilight: CalcConfig = {
  type: 'twilight',
  family: 'twilight',
  depth: 'simple',
  modelVersion: 2,
  path: '/twilight/quick',
  name: '황혼 이혼 계산기',
  title: '황혼 이혼 계산기',
  minutes: '약 1분',
  intro:
    '일곱 개의 질문으로, 오래 함께한 부부의 지금을 빠르게 살펴봅니다. 1분이면 됩니다. 이것은 빠른 선별 검사입니다 — 더 자세한 구조는 심화 검사에서 나눠 봅니다.',
  pronoun: { m: '아내', f: '남편', na: '배우자' },
  band: 7,
  steps: [{ title: '일곱 가지', caption: '떠오르는 대로 답하시면 됩니다.' }],
  dims: [
    { key: 'BOND', label: '유대', weight: 0.3 },
    { key: 'INT', label: '오가는 말', weight: 0.25 },
    { key: 'KEEP', label: '유지하는 힘', weight: 0.25 },
    { key: 'DIS', label: '정리를 향한 걸음', weight: 0.2 },
  ],
  flags: [
    {
      questionId: 'TS7',
      minChoiceIndex: 2,
      floor: 45,
      note: '시점을 두고 마음속 계획이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 황혼 이혼은 대개 그렇게 예고되어 있다가 조건이 갖춰지는 날 실행됩니다.',
    },
    {
      questionId: 'TS7',
      minChoiceIndex: 3,
      floor: 60,
      note: '별거 중이거나 절차를 알아본 적이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 이미 실행의 영역에 들어와 있기 때문입니다.',
    },
  ],
  questions: [
    {
      id: 'TS1',
      dim: 'BOND',
      step: 1,
      factor: 'SATISFACTION',
      text: '요즘의 결혼 생활에, 나는 만족한다.',
      choices: AR,
    },
    {
      id: 'TS2',
      dim: 'BOND',
      step: 1,
      factor: 'BOND_TALK',
      text: '요즘도 {배우자}와 마주 앉아 나누는 대화가 즐겁다.',
      choices: AR,
    },
    {
      id: 'TS3',
      dim: 'INT',
      step: 1,
      factor: 'CON_STONEWALL',
      text: '지난 한 달 동안, 말을 걸어도 대답이 짧게 끊기거나 대화가 이어지지 않는 날이 — 어느 쪽이 그랬든 — 있었나요?',
      choices: F,
    },
    {
      id: 'TS4',
      dim: 'INT',
      step: 1,
      factor: 'CON_CONTEMPT',
      text: '지난 한 달 동안, "당신이 뭘 알아" 같은 무시하는 말이 — 어느 쪽에서든 — 오간 적이 있었나요?',
      choices: F,
    },
    {
      id: 'TS5',
      dim: 'KEEP',
      step: 1,
      factor: 'CNS_REASON',
      text: '이 결혼을 유지해 온 이유를 하나만 꼽는다면?',
      choices: scene(
        ['함께 있는 것이 좋아서', 0],
        ['정이 들어서, 의리로', 1],
        ['자녀와 주변의 시선 때문에', 3],
        ['혼자 살 방법이 마땅치 않아서', 4],
      ),
    },
    {
      id: 'TS6',
      dim: 'KEEP',
      step: 1,
      factor: 'DED_FUTURE_PLAN',
      text: '앞으로의 시간(은퇴 후 포함)에 대해, 둘이서 하고 싶은 일을 이야기해 본 적이 있나요?',
      choices: scene(
        ['함께 이야기해 둔 것이 있다', 0],
        ['막연하지만 함께일 거라 생각한다', 1],
        ['각자의 계획이 따로 있다', 3],
        ['나 혼자만의 계획을 세워 두고 있다', 4],
      ),
    },
    {
      id: 'TS7',
      dim: 'DIS',
      step: 1,
      factor: 'MSI_STEP',
      text: '황혼이혼이나 졸혼에 대해, 어디까지 가 봤나요?',
      choices: scene(
        ['생각해 본 적 없다', 0],
        ['생각해 본 적은 있다', 1],
        ['자녀 독립 같은 시점을 두고 마음속 계획이 있다', 3],
        ['별거 중이거나, 절차·재산 문제를 알아본 적 있다', 4],
      ),
    },
  ],
};
