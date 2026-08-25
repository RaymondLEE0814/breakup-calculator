import { SAFETY_QUESTION, scene } from './scales.ts';
import type { DirectionChoice, FaultConfig, FaultQuestion } from './types.ts';

/**
 * 이혼 과실(유책) 비율 계산기 — 12문항 + 안전 문항. 약 5분.
 *
 * Grouped by the six grounds for judicial divorce in Korean civil law
 * (민법 제840조), minus the one that cannot coexist with someone sitting at a
 * questionnaire — three years of unexplained absence. That omission is stated
 * on the result page rather than hidden.
 *
 * Two design commitments carry the whole tool:
 *
 * 1. **Both sides, same wording.** A calculator that only asks what the other
 *    person did produces a number that is neither accurate nor useful, and
 *    feeds a fight. Every item asks how far something went, then who it came
 *    from, in identical language for both directions.
 * 2. **Behaviour, never verdict.** No item uses the words 잘못 or 책임. The
 *    result reports what the answers imply about a split; it does not tell
 *    anyone they are the guilty spouse, and it never estimates money.
 */

/** Asked under any item that reported something happened. */
const direction = (id: string): FaultQuestion['direction'] => ({
  id,
  text: '그 일은 주로 어느 쪽이었나요?',
  choices: [
    { label: '주로 {배우자} 쪽이었다', selfShare: 0.15 },
    { label: '양쪽 모두 비슷했다', selfShare: 0.5 },
    { label: '주로 내 쪽이었다', selfShare: 0.85 },
  ] satisfies DirectionChoice[],
});

export const fault: FaultConfig = {
  type: 'fault',
  family: 'divorce',
  depth: 'deep',
  modelVersion: 2,
  path: '/divorce/fault',
  name: '이혼 과실(유책) 비율 계산기',
  title: '이혼 과실(유책) 비율 계산기',
  minutes: '약 5분',
  intro:
    '재판상 이혼에서는 혼인 파탄에 대한 책임이 어느 쪽에 얼마나 있는지가 다뤄집니다. 이 계산기는 민법이 정한 재판상 이혼 사유의 범주를 따라, 지금까지의 혼인 생활을 나와 상대 양쪽에 대해 같은 기준으로 돌아보고, 책임이 어느 쪽에 얼마나 실려 있는지를 정리해 봅니다. 결과는 법률 판단이 아니며 실제 재판의 결론과 다를 수 있습니다. 법률 상담을 준비할 때 이야기를 정돈하는 용도로 쓰시길 권합니다. 답변은 기기 밖으로 나가지 않고, 저장되지 않습니다.',
  pronoun: { m: '아내', f: '남편', na: '배우자' },
  safety: SAFETY_QUESTION,
  minReportable: 8,
  steps: [
    { title: '신뢰', caption: '있었던 일만 묻습니다. 없었다면 없었다고 답하시면 됩니다.' },
    { title: '가정에 대한 책임', caption: '' },
    { title: '대우와 양가', caption: '' },
    { title: '돈', caption: '' },
    { title: '공동생활', caption: '마지막 두 가지입니다.' },
  ],
  dims: [
    { key: 'FID', label: '부정행위', weight: 0.25, note: '민법 제840조 1호' },
    { key: 'ABU', label: '심히 부당한 대우', weight: 0.2, note: '제840조 3호' },
    { key: 'DES', label: '악의의 유기', weight: 0.15, note: '제840조 2호' },
    { key: 'ECO', label: '경제적 신뢰 훼손', weight: 0.15, note: '제840조 6호의 범주' },
    { key: 'COM', label: '공동생활 파탄 기여', weight: 0.15, note: '제840조 6호의 범주' },
    { key: 'FAM', label: '직계존속 관련', weight: 0.1, note: '제840조 3호·4호' },
  ],
  questions: [
    {
      id: 'FT1',
      dim: 'FID',
      step: 1,
      factor: 'FAULT_AFFAIR',
      text: '혼인 기간 중, 배우자 아닌 사람과의 부정한 관계(외도)가 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['의심되는 정황은 있었지만 확인되지 않았다', 1],
        ['정서적으로 깊이 기운 관계(지속적 연락·만남)가 있었다', 3],
        ['성적인 관계가 있었음이 확인됐다', 4],
      ),
      direction: direction('FT1D'),
    },
    {
      id: 'FT2',
      dim: 'FID',
      step: 1,
      factor: 'FAULT_TRUST',
      text: '이성 문제로 신뢰가 깨진 일(거짓말, 숨긴 연락, 몰래 한 만남 등)은 어땠나요?',
      choices: scene(
        ['없었다', 0],
        ['한두 번 있었고 정리됐다', 1],
        ['여러 번 반복됐다', 3],
        ['지금도 이어지고 있다', 4],
      ),
      direction: direction('FT2D'),
    },
    {
      id: 'FT3',
      dim: 'DES',
      step: 2,
      factor: 'FAULT_LEAVE',
      text: '정당한 이유 없이 집을 나가거나, 가정을 떠나 있었던 일이 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['다툰 뒤 며칠 집을 비운 적이 있다', 1],
        ['수 주 이상 연락을 줄인 채 떠나 있던 적이 있다', 3],
        ['사실상 가정에 돌아오지 않고 있다', 4],
      ),
      direction: direction('FT3D'),
    },
    {
      id: 'FT4',
      dim: 'DES',
      step: 2,
      factor: 'FAULT_DUTY',
      text: '생활비 부담이나 가족 돌봄 같은 기본적인 책임을, 할 수 있는데도 하지 않은 일이 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['일시적으로 있었지만 회복됐다', 1],
        ['여러 번 반복됐다', 3],
        ['장기간 계속되고 있다', 4],
      ),
      direction: direction('FT4D'),
    },
    {
      id: 'FT5',
      dim: 'ABU',
      step: 3,
      factor: 'FAULT_VERBAL',
      text: '모욕적인 말, 폭언, 인격을 깎아내리는 말이 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['다툼이 격해질 때 드물게 있었다', 1],
        ['갈등이 있을 때마다 반복됐다', 3],
        ['갈등과 무관하게 일상적으로 있었다', 4],
      ),
      direction: direction('FT5D'),
    },
    {
      id: 'FT6',
      dim: 'ABU',
      step: 3,
      factor: 'FAULT_THREAT',
      text: '협박하는 말, 물건을 던지거나 부수는 행동처럼 위협을 느끼게 하는 행동이 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['한두 번 있었다', 2],
        ['여러 번 있었다', 3],
        ['반복됐고 최근에도 있었다', 4],
      ),
      direction: direction('FT6D'),
    },
    {
      id: 'FT7',
      dim: 'FAM',
      step: 3,
      factor: 'FAULT_INLAW_ACT',
      text: '상대의 부모나 가족에게 모욕적인 말이나 심하게 부당한 행동을 한 일이 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['갈등 중에 한두 번 있었다', 1],
        ['여러 번 반복됐다', 3],
        ['관계가 끊어질 정도로 심했다', 4],
      ),
      direction: direction('FT7D'),
    },
    {
      id: 'FT8',
      dim: 'FAM',
      step: 3,
      factor: 'FAULT_INLAW_SIDE',
      text: '한쪽 부모·가족이 배우자를 심하게 부당하게 대할 때, 이를 막지 않고 방치하거나 동조한 일이 있었나요?',
      choices: scene(
        ['그런 상황 자체가 없었다', 0],
        ['한두 번 있었다', 1],
        ['반복해서 있었다', 3],
        ['항상 자기 가족 편에 서서 배우자가 견뎌야 했다', 4],
      ),
      direction: direction('FT8D'),
    },
    {
      id: 'FT9',
      dim: 'ECO',
      step: 4,
      factor: 'FAULT_SQUANDER',
      text: '도박, 무리한 투자, 반복적인 낭비로 가계를 위태롭게 한 일이 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['한두 번 있었고 수습됐다', 1],
        ['반복됐다', 3],
        ['지금도 계속되어 가계가 흔들리고 있다', 4],
      ),
      direction: direction('FT9D'),
    },
    {
      id: 'FT10',
      dim: 'ECO',
      step: 4,
      factor: 'FAULT_HIDDEN_MONEY',
      text: '몰래 빚을 지거나, 수입·재산을 숨기는 등 돈 문제로 속인 일이 있었나요?',
      choices: scene(
        ['없었다', 0],
        ['사소한 것을 한두 번 숨겼다', 1],
        ['큰 금액을 숨긴 일이 있었다', 3],
        ['반복적으로 속여 왔고 신뢰가 무너졌다', 4],
      ),
      direction: direction('FT10D'),
    },
    {
      id: 'FT11',
      dim: 'COM',
      step: 5,
      factor: 'FAULT_SEPARATE_LIFE',
      text: '장기간의 대화 단절, 각방 생활처럼 부부로서의 공동생활이 사실상 멈춘 상태를 만든 일이 있었나요?',
      choices: scene(
        ['그런 상태가 아니다', 0],
        ['짧게 있었지만 회복됐다', 1],
        ['수개월째 이어지고 있다', 3],
        ['몇 년째 사실상 남처럼 지낸다', 4],
      ),
      direction: direction('FT11D'),
    },
    {
      id: 'FT12',
      dim: 'COM',
      step: 5,
      factor: 'FAULT_REFUSE_REPAIR',
      text: '관계를 회복하려는 상대의 시도(대화 제안, 상담 제안 등)를 거부하거나 무시한 일이 있었나요?',
      choices: scene(
        ['그런 시도가 필요한 상황이 아니었다', 0],
        ['한두 번 미룬 적이 있다', 1],
        ['반복해서 거부했다', 3],
        ['어떤 시도도 받아들이지 않았다', 4],
      ),
      direction: direction('FT12D'),
    },
  ],
};

/** Result-page copy for each ground, keyed by dimension. */
export const FAULT_DIM_NOTE: Record<string, string> = {
  FID: '부정행위는 재판상 이혼 사유 중에서도 실무에서 자주 다뤄지는 축에 속합니다. 다만 인정 여부와 책임의 크기는 사안과 증거에 따라 다릅니다.',
  ABU: '심히 부당한 대우는 민법이 정한 재판상 이혼 사유의 하나입니다. 어느 정도를 "심히"로 볼지는 사안에 따라 판단이 갈립니다.',
  DES: '악의의 유기는 정당한 이유 없이 동거·부양·협조 의무를 저버린 경우를 말합니다. 사정이 있었는지가 함께 따져집니다.',
  ECO: '도박·낭비·재산 은닉 같은 문제는 그 자체로 조문에 열거된 사유는 아니지만, 혼인을 계속하기 어려운 중대한 사유로 다뤄지는 범주입니다.',
  COM: '장기간의 별거나 회복 시도의 거부는 파탄의 원인과 결과가 뒤엉키기 쉬운 영역이라, 어느 쪽이 먼저였는지가 함께 따져집니다.',
  FAM: '배우자의 직계존속에 대한, 또는 직계존속에 의한 심히 부당한 대우는 각각 별도의 이혼 사유로 정해져 있습니다.',
};
