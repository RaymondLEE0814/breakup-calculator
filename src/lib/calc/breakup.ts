import type { CalcConfig } from './types';

/**
 * 연인용 — 헤어질 확률 계산기. 16문항 / 4스텝.
 *
 * Scoring notes that apply to the whole set:
 * - The behaviour axis carries half the weight because conflict style is the
 *   variable relationship research actually predicts on. Age gap, income and
 *   schooling are supporting signals, never verdicts.
 * - Every economic question asks about *felt gap and friction*, not amounts.
 *   We never collect a salary, a height or a net worth: ranking people by spec
 *   is both the wrong model and the wrong product.
 */
export const breakup: CalcConfig = {
  type: 'breakup',
  path: '/breakup',
  name: '연애 헤어질 확률 계산기',
  title: '연애 헤어질 확률 계산기',
  intro:
    '16개의 질문에 답하면, 두 사람 관계의 위험 신호를 네 가지 축으로 정리해 드립니다. 점수를 매기기 위한 검사가 아니라, 돌아보기 위한 검사입니다. 솔직하게 답할수록 정확해집니다.',
  pronoun: { m: '여자친구', f: '남자친구', na: '애인' },
  steps: [
    { title: '우리의 조건', caption: '두 사람이 놓인 상황을 먼저 봅니다.' },
    { title: '우리가 다투는 방식', caption: '관계를 가장 크게 좌우하는 부분입니다.' },
    { title: '현실의 무게', caption: '액수가 아니라, 두 사람 사이의 간극을 묻습니다.' },
    { title: '지금의 마음', caption: '마지막 두 가지입니다.' },
  ],
  axes: [
    { key: 'behavior', label: '대화와 갈등', weight: 0.5 },
    { key: 'structure', label: '관계의 조건', weight: 0.2 },
    { key: 'economy', label: '현실과 경제', weight: 0.2 },
    { key: 'outlook', label: '마음과 전망', weight: 0.1 },
  ],
  questions: [
    {
      id: 'A1',
      axis: 'structure',
      step: 1,
      text: '두 사람이 사귄 지 얼마나 되었나요?',
      choices: [
        { label: '3개월 미만', score: 8 },
        { label: '3개월~1년', score: 6 },
        { label: '1~3년', score: 3 },
        { label: '3~7년', score: 2 },
        { label: '7년 이상', score: 3 },
      ],
    },
    {
      id: 'A2',
      axis: 'structure',
      step: 1,
      text: '두 사람의 나이 차이는 어느 정도인가요?',
      choices: [
        { label: '2살 이하', score: 0 },
        { label: '3~5살', score: 1 },
        { label: '6~9살', score: 2 },
        { label: '10살 이상', score: 4 },
      ],
    },
    {
      id: 'A3',
      axis: 'structure',
      step: 1,
      text: '두 사람은 얼마나 자주 만날 수 있나요?',
      choices: [
        { label: '원하면 언제든 (같은 동네·동거)', score: 0 },
        { label: '주 1~2회는 만난다', score: 1 },
        { label: '한 달에 1~2회 (장거리)', score: 4 },
        { label: '몇 달에 한 번 (해외 등)', score: 6 },
      ],
    },
    {
      id: 'A4',
      axis: 'structure',
      step: 1,
      text: '결혼(또는 관계의 미래)에 대한 두 사람의 생각은?',
      choices: [
        { label: '방향이 같고, 시기도 이야기해 봤다', score: 0 },
        { label: '아직 진지하게 이야기해 본 적 없다', score: 2 },
        { label: '둘 다 결혼 생각이 없다 (서로 합의됨)', score: 1 },
        { label: '한 사람만 원하고 있다', score: 6 },
      ],
    },
    {
      id: 'A5',
      axis: 'behavior',
      step: 2,
      text: '다툴 때, 대화는 주로 어떻게 흘러가나요?',
      choices: [
        { label: '문제가 된 일 자체를 이야기한다', score: 0 },
        { label: '가끔 서로의 성격을 건드리게 된다', score: 3 },
        { label: '"너는 항상", "너는 절대" 같은 말이 자주 나온다', score: 6 },
        { label: '아예 싸우지 않는다 (문제를 덮는다)', score: 4 },
      ],
    },
    {
      id: 'A6',
      axis: 'behavior',
      step: 2,
      text: '{상대}와의 대화에서 비웃음, 무시, 비꼬는 말이 오가나요? (내가 하든, 상대가 하든)',
      choices: [
        { label: '거의 없다', score: 0 },
        { label: '드물게 있다', score: 4 },
        { label: '종종 있다', score: 8 },
        { label: '자주 있고, 익숙해졌다', score: 10 },
      ],
    },
    {
      id: 'A7',
      axis: 'behavior',
      step: 2,
      text: '갈등이 생기면 연락을 끊거나 침묵하는 편인가요? (둘 중 누구든)',
      choices: [
        { label: '그런 적 없다', score: 0 },
        { label: '몇 시간 정도 각자 식힌다', score: 2 },
        { label: '며칠씩 연락이 뜸해진다', score: 5 },
        { label: '잠수·연락두절이 반복된다', score: 8 },
      ],
    },
    {
      id: 'A8',
      axis: 'behavior',
      step: 2,
      text: '싸운 뒤 한쪽이 먼저 화해를 시도하면?',
      choices: [
        { label: '대체로 받아들여지고 풀린다', score: 0 },
        { label: '풀릴 때도, 안 풀릴 때도 있다', score: 2 },
        { label: '시도해도 잘 받아들여지지 않는다', score: 6 },
      ],
    },
    {
      id: 'A9',
      axis: 'behavior',
      step: 2,
      text: '애정 표현(말, 스킨십)은 얼마나 자주 오가나요?',
      choices: [
        { label: '거의 매일', score: 0 },
        { label: '일주일에 몇 번', score: 1 },
        { label: '드물다', score: 4 },
        { label: '기억이 잘 안 난다', score: 6 },
      ],
    },
    {
      id: 'A10',
      axis: 'behavior',
      step: 2,
      text: '{상대}에 대한 믿음은 어떤가요?',
      choices: [
        { label: '의심해 본 적 없다', score: 0 },
        { label: '가끔 불안할 때가 있다', score: 2 },
        { label: '휴대폰을 확인하고 싶은 충동이 든다', score: 5 },
        { label: '실제로 확인하거나, 그 일로 다툰 적 있다', score: 8 },
      ],
    },
    {
      id: 'A11',
      axis: 'economy',
      step: 3,
      text: '서로의 직업·소득에 대해 두 사람은 어떻게 느끼나요?',
      choices: [
        { label: '둘 다 서로에게 만족한다', score: 0 },
        { label: '한 사람이 아쉬움을 내비친 적 있다', score: 3 },
        { label: '이 주제로 갈등한 적이 여러 번 있다', score: 6 },
      ],
    },
    {
      id: 'A12',
      axis: 'economy',
      step: 3,
      text: '데이트 비용이나 돈 이야기는 편하게 하나요?',
      choices: [
        { label: '나름의 규칙이 있고 편하다', score: 0 },
        { label: '정한 건 없지만 무난하다', score: 1 },
        { label: '가끔 서운함이 쌓인다', score: 3 },
        { label: '돈 이야기가 다툼으로 번진 적 있다', score: 6 },
      ],
    },
    {
      id: 'A13',
      axis: 'economy',
      step: 3,
      text: '학력·집안·조건 차이를 의식하게 되나요? (본인이든, 상대든, 양가든)',
      choices: [
        { label: '신경 쓰지 않는다', score: 0 },
        { label: '가끔 의식하게 된다', score: 2 },
        { label: '상대나 주변에서 실제로 언급된 적 있다', score: 5 },
      ],
    },
    {
      id: 'A14',
      axis: 'economy',
      step: 3,
      text: '집·결혼자금 같은 미래의 경제 계획을 이야기해 본 적 있나요?',
      choices: [
        { label: '구체적으로 이야기해 봤다', score: 0 },
        { label: '막연하게는 해봤다', score: 1 },
        { label: '왠지 피하게 된다', score: 4 },
        { label: '꺼내면 싸움이 된다', score: 6 },
      ],
    },
    {
      id: 'A15',
      axis: 'outlook',
      step: 4,
      text: '요즘 두 사람의 대화량은 어떤가요?',
      choices: [
        { label: '시시콜콜한 것까지 나눈다', score: 0 },
        { label: '보통이다', score: 1 },
        { label: '예전보다 확실히 줄었다', score: 4 },
        { label: '용건이 있을 때만 연락한다', score: 6 },
      ],
    },
    {
      id: 'A16',
      axis: 'outlook',
      step: 4,
      text: '솔직히, 이 관계가 계속될 거라고 생각하나요?',
      choices: [
        { label: '그렇다, 확신한다', score: 0 },
        { label: '대체로 그렇다', score: 2 },
        { label: '요즘 흔들린다', score: 5 },
        { label: '헤어지는 상상을 자주 한다', score: 8 },
      ],
    },
  ],
};
