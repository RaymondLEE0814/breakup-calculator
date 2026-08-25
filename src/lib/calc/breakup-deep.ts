import { A, AR, F, P, SAFETY_QUESTION, scene } from './scales.ts';
import type { CalcConfig } from './types.ts';

/**
 * 연애 심화형 — 33문항 + 안전 문항. 7~8분.
 *
 * Built on the investment model: satisfaction, quality of alternatives and
 * investment size act on whether a relationship lasts *through* commitment,
 * not beside it. That mediation is why this config has a `mediation` block —
 * commitment is scored partly as reported and partly as the model implies it
 * from its three inputs.
 *
 * Unmarried relationships have no institutional barriers — no property, no
 * proceedings, usually no children. What is left is the psychological
 * arithmetic, and quality of alternatives is the term the old model missed
 * entirely. Conflict process (Gottman), attachment (the upstream cause of
 * those patterns) and external stress round it out; stress is multiplied by
 * conflict rather than added to it, because pressure only breaks couples who
 * handle it badly.
 */
export const breakupDeep: CalcConfig = {
  type: 'breakup-deep',
  family: 'breakup',
  depth: 'deep',
  modelVersion: 2,
  path: '/breakup/deep',
  name: '연애 관계 심화 진단',
  title: '연애 관계 심화 진단',
  minutes: '약 7분',
  intro:
    '서른세 개의 질문으로, 지금 이 관계를 일곱 개의 구조로 나눠 봅니다. 만족은 어느 정도인지, 관계를 붙잡는 것은 무엇인지, 다툼은 어디에서 어긋나는지를 따로따로 봅니다. 빠른 검사가 숫자 하나를 준다면, 이 검사는 그 숫자가 어디에서 왔는지를 알려 드립니다.',
  pronoun: { m: '여자친구', f: '남자친구', na: '애인' },
  safety: SAFETY_QUESTION,
  steps: [
    { title: '지금의 마음', caption: '먼저 이 관계에 대한 느낌부터 봅니다.' },
    { title: '이 관계의 무게', caption: '무엇이 두 사람을 붙잡고 있는지 봅니다.' },
    { title: '다툼의 해부', caption: '가장 많은 것을 알려주는 부분입니다.' },
    { title: '나라는 사람', caption: '갈등 패턴의 상류에 있는 것들입니다.' },
    { title: '마지막 한 가지', caption: '' },
  ],
  dims: [
    { key: 'SAT', label: '만족', weight: 0.16, note: '이 관계가 지금 주고 있는 것' },
    { key: 'ALT', label: '대안의 매력', weight: 0.1, note: '이 사람이 아니어도 괜찮은가' },
    { key: 'INV', label: '쌓아 온 것', weight: 0.07, note: '정리하려면 잃게 되는 것들' },
    { key: 'DED', label: '헌신', weight: 0.22, note: '남고 싶은 마음과 그 지속성' },
    { key: 'CON', label: '갈등 과정', weight: 0.22, note: '부딪힐 때 벌어지는 일' },
    { key: 'ATT', label: '애착 방식', weight: 0.08, note: '가까움을 다루는 습관' },
    { key: 'STR', label: '바깥의 압력', weight: 0.07, note: '관계 밖에서 오는 무게' },
    {
      key: 'MSI',
      label: '이별을 향한 걸음',
      weight: 0,
      levelOnly: true,
      note: '지수에 더해지지 않고, 아래 하한으로만 작동합니다',
    },
  ],
  mediation: {
    target: 'DED',
    directWeight: 0.5,
    sources: [
      { dim: 'SAT', weight: 0.5 },
      { dim: 'ALT', weight: 0.3 },
      { dim: 'INV', weight: 0.2 },
    ],
  },
  interactions: [
    {
      key: 'I',
      label: '압력 × 대처',
      a: 'STR',
      b: 'CON',
      weight: 0.08,
      note: '바깥의 압력이 큰데 다투는 방식까지 거칠면, 두 가지가 곱해져서 작용합니다. 어느 한쪽만 높을 때보다 훨씬 위험합니다.',
    },
  ],
  flags: [
    {
      questionId: 'BD33',
      minChoiceIndex: 2,
      floor: 40,
      note: '주변 사람과 이별을 진지하게 상의했다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 관계 밖으로 말이 나가는 것은 혼자 생각하는 것과 다른 단계입니다.',
    },
    {
      questionId: 'BD33',
      minChoiceIndex: 3,
      floor: 52,
      note: '이별을 통보했거나 이별과 재회를 반복하고 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 이미 실행이 일어난 관계이기 때문입니다.',
    },
  ],
  types: {
    x: { dim: 'SAT', label: '만족', cut: 50 },
    y: { dim: 'DED', label: '헌신', cut: 50 },
    quadrants: {
      ll: {
        code: 'companion',
        name: '동행형',
        body: '지금도 좋고, 계속할 마음도 있습니다. 지수가 낮게 나왔다면 그 숫자를 믿으셔도 됩니다. 이 유형에서 할 일은 무언가를 고치는 것이 아니라, 지금 하고 있는 것이 무엇인지 알아 두는 것입니다.',
      },
      lh: {
        code: 'drift',
        name: '표류형',
        body: '함께 있는 시간은 즐겁지만, 이 관계가 어디로 가는지는 아무도 정하지 않았습니다. 흘러가는 것과 나아가는 것은 다릅니다. 방향에 대한 대화를 미룰수록, 결정은 두 사람이 아니라 상황이 하게 됩니다.',
      },
      hl: {
        code: 'inertia',
        name: '관성형',
        body: '만족보다 쌓아 온 것들이 관계를 지탱하고 있습니다. 버티는 힘은 있지만, 버티는 것이 목표가 되면 만족은 더 내려갑니다. 무엇이 만족을 깎고 있는지부터 좁혀 보세요.',
      },
      hh: {
        code: 'crossroad',
        name: '갈림길형',
        body: '머무를 이유도, 머무르고 싶은 마음도 함께 약해져 있습니다. 지금 필요한 것은 결론이 아니라, 이 상태를 마주 보는 대화입니다. 결론을 서두르면 대개 같은 자리로 돌아옵니다.',
      },
    },
  },
  questions: [
    // ── 스텝 1 · 지금의 마음 ──────────────────────────────────────────
    {
      id: 'BD1',
      dim: 'SAT',
      step: 1,
      factor: 'SATISFACTION',
      text: '관계 전반을 놓고 보면, 나는 이 연애에 만족한다.',
      choices: AR,
    },
    {
      id: 'BD2',
      dim: 'SAT',
      step: 1,
      factor: 'COMFORT',
      text: '{상대}와 함께 있는 시간은 나를 편안하게 만든다.',
      choices: AR,
    },
    {
      id: 'BD3',
      dim: 'SAT',
      step: 1,
      factor: 'NEEDS_MET',
      text: '이 관계에는 내가 연애에서 바라던 것들이 대체로 들어 있다.',
      choices: AR,
    },
    {
      id: 'BD4',
      dim: 'SAT',
      step: 1,
      factor: 'WEEKEND_SCENE',
      text: '연휴나 주말이 다가올 때 드는 솔직한 마음은?',
      choices: scene(
        ['같이 보낼 생각에 기대가 된다', 0],
        ['별 생각이 없다', 2],
        ['일정을 어떻게 잡을지 부담스러울 때가 있다', 3],
        ['혼자 보내고 싶다는 생각이 먼저 든다', 4],
      ),
    },
    {
      id: 'BD5',
      dim: 'SAT',
      step: 1,
      factor: 'SHARED_LAUGHTER',
      text: '지난 한 달 동안, {상대}와 함께 있으면서 소리 내어 웃은 날이 얼마나 있었나요?',
      choices: P,
    },
    {
      id: 'BD14',
      dim: 'DED',
      step: 1,
      factor: 'DED_WE',
      text: '앞일을 생각할 때, 나는 "나"보다 "우리"를 기본값으로 놓고 생각한다.',
      choices: AR,
    },
    {
      id: 'BD15',
      dim: 'DED',
      step: 1,
      factor: 'DED_DECISION',
      text: '이직이나 이사처럼 큰 결정을 하게 된다면, {상대}는 그 결정에서 어떤 자리인가요?',
      choices: scene(
        ['당연히 함께 상의할 사람이다', 0],
        ['결정한 뒤에 알리는 편이다', 2],
        ['굳이 변수로 넣지 않는다', 3],
        ['그때까지 이 관계가 이어질지부터 모르겠다', 4],
      ),
    },
    {
      id: 'BD16',
      dim: 'DED',
      step: 1,
      factor: 'DED_SLIDING',
      text: '이 관계의 다음 단계(동거, 결혼 등)에 대해 두 사람은?',
      choices: scene(
        ['이야기해 봤고, 방향이 같다', 0],
        ['흘러가는 대로 두고 있다', 2],
        ['이야기해 봤지만 방향이 다르다', 3],
        ['서로 그 이야기를 꺼내지 않으려 한다', 4],
      ),
    },
    {
      id: 'BD17',
      dim: 'DED',
      step: 1,
      factor: 'DED_EROSION',
      text: '요즘 나는 이 관계를 "계속할지 말지"의 눈으로 바라보고 있다.',
      choices: A,
    },

    // ── 스텝 2 · 이 관계의 무게 ───────────────────────────────────────
    {
      id: 'BD6',
      dim: 'ALT',
      step: 2,
      factor: 'ALT_GAP',
      text: '지금 헤어진다 해도, 내 일상에서 비는 부분은 생각보다 크지 않을 것이다.',
      choices: A,
    },
    {
      id: 'BD7',
      dim: 'ALT',
      step: 2,
      factor: 'ALT_TEMPT',
      text: '매력적인 사람이 나에게 호감을 표현해 온다면?',
      choices: scene(
        ['고맙지만 정리하고 지나간다. 흔들리지 않는다', 0],
        ['기분은 좋지만 선은 확실히 지킨다', 1],
        ['어떤 사이가 될 수 있을지 상상해 보게 된다', 3],
        ['실제로 연락을 이어가 본 적이 있다', 4],
      ),
    },
    {
      id: 'BD8',
      dim: 'ALT',
      step: 2,
      factor: 'ALT_COMPARE',
      text: '주변에, 지금의 {상대}보다 나와 더 잘 맞을 것 같은 사람이 떠오른다.',
      choices: A,
    },
    {
      id: 'BD9',
      dim: 'ALT',
      step: 2,
      factor: 'ALT_REHEARSE',
      text: '지난 한 달 동안, 헤어진 뒤의 생활을 구체적으로 상상해 본 적이 있었나요?',
      choices: F,
    },
    {
      id: 'BD10',
      dim: 'INV',
      step: 2,
      factor: 'INV_SOCIAL',
      text: '두 사람은 서로의 친구·가족과 얼마나 얽혀 있나요?',
      choices: scene(
        ['양쪽 모두의 사람들과 깊이 얽혀 있다', 0],
        ['한쪽의 사람들과는 얽혀 있다', 1],
        ['소개는 했지만 왕래는 없다', 2],
        ['서로의 사람들과 거의 접점이 없다', 4],
      ),
    },
    {
      id: 'BD11',
      dim: 'INV',
      step: 2,
      factor: 'INV_SHARED',
      text: '함께 만들어 온 것들(추억, 물건, 계획, 반려동물, 얽힌 돈 문제 등)이 이 관계에 얼마나 쌓여 있나요?',
      choices: scene(
        ['많다. 정리하려면 한참 걸릴 정도다', 0],
        ['꽤 있다', 1],
        ['조금 있다', 3],
        ['거의 없다. 각자의 생활이 분리되어 있다', 4],
      ),
    },
    {
      id: 'BD12',
      dim: 'INV',
      step: 2,
      factor: 'INV_SACRIFICE',
      text: '이 관계를 위해 내가 미루거나 양보해 온 것들이 있다.',
      choices: AR,
    },
    {
      id: 'BD13',
      dim: 'INV',
      step: 2,
      factor: 'INV_FUTURE',
      text: '두 사람이 함께 잡아 둔 미래의 약속(여행, 행사, 계약, 함께 모으는 돈 등)이 있나요?',
      choices: scene(
        ['여러 개 있다', 0],
        ['한두 개 있다', 1],
        ['예전엔 있었지만 지금은 없다', 3],
        ['만들어 본 적이 없다', 4],
      ),
    },

    // ── 스텝 3 · 다툼의 해부 ──────────────────────────────────────────
    {
      id: 'BD18',
      dim: 'CON',
      step: 3,
      factor: 'CON_CRITICISM',
      text: '지난 한 달 동안의 다툼에서, 벌어진 일이 아니라 사람 자체를 지적하는 말("너는 원래 그래", "너는 항상")이 — 어느 쪽에서든 — 나온 적이 있었나요?',
      choices: F,
    },
    {
      id: 'BD19',
      dim: 'CON',
      step: 3,
      factor: 'CON_CONTEMPT',
      text: '지난 한 달 동안, 비꼬는 말투, 눈 굴리기, 한숨 섞인 비웃음이 — 어느 쪽에서든 — 나온 적이 있었나요?',
      choices: F,
    },
    {
      id: 'BD20',
      dim: 'CON',
      step: 3,
      factor: 'CON_DEFENSIVE',
      text: '잘못을 지적받으면, 나든 {상대}든 사과보다 해명이나 "너도 그랬잖아"가 먼저 나오는 편이다.',
      choices: A,
    },
    {
      id: 'BD21',
      dim: 'CON',
      step: 3,
      factor: 'CON_WITHDRAW',
      text: '한 사람이 서운함을 꺼내면, 보통 어떻게 되나요?',
      choices: scene(
        ['길든 짧든 결국 대화가 된다', 0],
        ['타이밍을 미루긴 해도 이야기하게 된다', 1],
        ['한쪽이 입을 닫거나 자리를 뜬다', 3],
        ['꺼내던 쪽이 지쳐서, 이제는 꺼내지 않게 됐다', 4],
      ),
    },
    {
      id: 'BD22',
      dim: 'CON',
      step: 3,
      factor: 'CON_REPAIR',
      text: '다툼이 격해질 때 농담, 사과, "우리 잠깐만" 같은 브레이크가 걸리면?',
      choices: scene(
        ['대체로 받아들여져서 분위기가 꺾인다', 0],
        ['가끔은 통한다', 1],
        ['거의 무시되고 싸움이 이어진다', 3],
        ['그런 시도 자체가 없다', 4],
      ),
    },
    {
      id: 'BD23',
      dim: 'CON',
      step: 3,
      factor: 'CON_POSITIVE',
      text: '지난 한 달 동안, 고맙다는 말이나 칭찬을 주고받은 날이 얼마나 있었나요?',
      choices: P,
    },
    {
      id: 'BD24',
      dim: 'CON',
      step: 3,
      factor: 'CON_FLOOD',
      text: '다툼이 시작되면 심장이 뛰고 머리가 하얘져서, 무슨 말이 오갔는지 기억나지 않을 때가 있다.',
      choices: A,
    },
    {
      id: 'BD25',
      dim: 'CON',
      step: 3,
      factor: 'CON_GRIDLOCK',
      text: '크게 다툰 문제는, 그 뒤에 보통 어떻게 되나요?',
      choices: scene(
        ['이야기가 마무리되어 같은 일로는 다시 안 싸운다', 0],
        ['봉합은 되는데 가끔 다시 나온다', 1],
        ['같은 문제로 반복해서 싸운다', 3],
        ['아예 꺼내면 안 되는 금지어가 됐다', 4],
      ),
    },

    // ── 스텝 4 · 나라는 사람 ──────────────────────────────────────────
    {
      id: 'BD26',
      dim: 'ATT',
      step: 4,
      factor: 'ATT_ANXIETY',
      text: '답장이 늦거나 연락이 뜸해지면, 관계 전체가 흔들리는 것처럼 불안해진다.',
      choices: A,
    },
    {
      id: 'BD27',
      dim: 'ATT',
      step: 4,
      factor: 'ATT_CHECKING',
      text: '지난 한 달 동안, {상대}의 마음을 확인하려고 SNS나 메신저 접속 기록 같은 것을 살펴본 적이 있었나요?',
      choices: F,
    },
    {
      id: 'BD28',
      dim: 'ATT',
      step: 4,
      factor: 'ATT_AVOID_SELF',
      text: '고민이 생겼을 때, {상대}에게 말하기보다 혼자 처리하는 쪽이 편하다.',
      choices: A,
    },
    {
      id: 'BD29',
      dim: 'ATT',
      step: 4,
      factor: 'ATT_AVOID_DISTANCE',
      text: '{상대}가 더 가까워지려 할수록, 나도 모르게 거리를 두고 싶어질 때가 있다.',
      choices: A,
    },
    {
      id: 'BD30',
      dim: 'STR',
      step: 4,
      factor: 'STR_EXTERNAL',
      text: '지난 세 달 동안, 두 사람 바깥의 일(일·학업·가족·건강·돈 문제)로 내 마음의 여유가 눈에 띄게 줄었다.',
      choices: A,
    },
    {
      id: 'BD31',
      dim: 'STR',
      step: 4,
      factor: 'STR_MONEY',
      text: '지난 한 달 동안, 데이트 비용이나 소비 방식 때문에 마음이 상하거나 눈치를 본 적이 있었나요?',
      choices: F,
    },
    {
      id: 'BD32',
      dim: 'STR',
      step: 4,
      factor: 'STR_RESOURCE',
      text: '힘든 일이 있을 때, 이 관계는 나에게 어떤 곳인가요?',
      choices: scene(
        ['기대는 곳이다', 0],
        ['부담을 주지는 않는 곳이다', 1],
        ['신경 쓸 일이 하나 더 있는 곳이다', 3],
        ['힘든 일 그 자체일 때가 많다', 4],
      ),
    },

    // ── 스텝 5 · 마지막 한 가지 ───────────────────────────────────────
    {
      id: 'BD33',
      dim: 'MSI',
      step: 5,
      factor: 'MSI_STEP',
      text: '이별에 대해, 실제로 어디까지 가 봤나요?',
      choices: scene(
        ['진지하게 생각해 본 적 없다', 0],
        ['혼자 진지하게 생각해 봤다', 1],
        ['주변 사람과 진지하게 상의했다', 3],
        ['{상대}에게 이별을 통보했거나, 이별과 재회를 반복하고 있다', 4],
      ),
    },
  ],
};
