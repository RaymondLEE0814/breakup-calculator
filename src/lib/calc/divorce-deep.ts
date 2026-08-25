import { A, AR, F, F3, P, SAFETY_QUESTION, scene } from './scales.ts';
import type { CalcConfig } from './types.ts';

/**
 * 부부 심화형 — 34문항 + 안전 문항. 8~10분.
 *
 * Organised by the vulnerability–stress–adaptation frame: enduring
 * vulnerabilities, external stress and how a couple adapts are not three
 * separate risks but one system. Money, children and in-laws break marriages
 * that handle conflict badly and bounce off marriages that handle it well, so
 * stress is multiplied by adaptation rather than added to it.
 *
 * The second interaction term is the one the old model had no way to express:
 * constraint × low dedication. Being held in place by children, money or
 * other people's opinions is not a risk on its own — a devoted couple with
 * heavy constraints is simply a settled couple. It becomes a risk precisely
 * when the wish to stay has gone and only the difficulty of leaving remains.
 * That is why CNS carries weight 0 in the linear sum and appears only inside
 * the G term.
 */
export const divorceDeep: CalcConfig = {
  type: 'divorce-deep',
  family: 'divorce',
  depth: 'deep',
  modelVersion: 2,
  path: '/divorce/deep',
  name: '부부 관계 심화 진단',
  title: '부부 관계 심화 진단',
  minutes: '약 9분',
  intro:
    '서른네 개의 질문으로, 지금의 결혼을 여덟 개의 구조로 나눠 봅니다. 만족과 대화 방식뿐 아니라, 무엇이 이 결혼을 붙잡고 있는지와 바깥의 압력이 어디에서 새어 들어오는지를 따로 봅니다. 빠른 검사가 숫자 하나를 준다면, 이 검사는 그 숫자가 어디에서 왔는지를 알려 드립니다.',
  pronoun: { m: '아내', f: '남편', na: '배우자' },
  safety: SAFETY_QUESTION,
  steps: [
    { title: '지금의 결혼', caption: '먼저 결혼 생활에 대한 느낌부터 봅니다.' },
    { title: '부딪히는 방식', caption: '가장 많은 것을 알려주는 부분입니다.' },
    { title: '현실의 압력', caption: '액수가 아니라 다루는 방식을 묻습니다.' },
    { title: '붙잡는 것과 여는 것', caption: '무엇이 이 결혼을 유지하고 있는지 봅니다.' },
    { title: '마지막 세 가지', caption: '' },
  ],
  dims: [
    { key: 'SAT', label: '결혼 만족', weight: 0.15, note: '이 결혼이 지금 주고 있는 것' },
    { key: 'ADP', label: '적응 과정', weight: 0.2, note: '부딪힐 때 벌어지는 일' },
    { key: 'DED', label: '헌신', weight: 0.1, note: '남고 싶은 마음' },
    {
      key: 'CNS',
      label: '제약 수준',
      weight: 0,
      levelOnly: true,
      note: '높다고 위험한 것이 아닙니다. 헌신이 낮을 때에만 위험이 됩니다',
    },
    { key: 'ALT', label: '대안과 장벽', weight: 0.08, note: '혼자가 되는 그림의 선명도' },
    { key: 'STR', label: '바깥의 압력', weight: 0.12, note: '돈·자녀·양가·역할·친밀감' },
    { key: 'VUL', label: '지속 취약성', weight: 0.05, note: '두 사람이 안고 들어온 것' },
    { key: 'MSI', label: '이혼을 향한 걸음', weight: 0.12, note: '실제로 움직인 거리' },
  ],
  interactions: [
    {
      key: 'I',
      label: '압력 × 대처',
      a: 'STR',
      b: 'ADP',
      weight: 0.08,
      note: '바깥의 압력이 큰데 부딪히는 방식까지 거칠면, 두 가지가 곱해져서 작용합니다. 같은 스트레스도 잘 넘기는 부부가 있는 이유입니다.',
    },
    {
      key: 'G',
      label: '헌신 없는 제약',
      a: 'DED',
      b: 'CNS',
      weight: 0.1,
      note: '남고 싶은 마음은 옅은데 떠나기 어려운 조건만 많을 때 커지는 항입니다. 조건은 시간이 지나면 하나씩 사라집니다.',
    },
  ],
  flags: [
    {
      questionId: 'DD33',
      minChoiceIndex: 2,
      floor: 50,
      note: '이혼이나 별거를 진지하게 이야기한 적이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 말이 되어 나온 이혼은 생각에 머물던 이혼과 다른 단계입니다.',
    },
    {
      questionId: 'DD33',
      minChoiceIndex: 3,
      floor: 58,
      note: '별거 중이거나 별거한 적이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다.',
    },
    {
      questionId: 'DD34',
      minChoiceIndex: 2,
      floor: 55,
      note: '이혼의 절차나 조건을 구체적으로 알아본 적이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다.',
    },
    {
      questionId: 'DD34',
      minChoiceIndex: 3,
      floor: 65,
      note: '전문가와 상담했거나 서류를 준비해 본 적이 있다는 응답은, 다른 응답과 별개로 지수를 끌어올립니다. 이미 실행의 영역에 들어와 있기 때문입니다.',
    },
  ],
  types: {
    x: { dim: 'ADP', label: '상호작용', cut: 50 },
    y: { dim: 'DED', label: '헌신', cut: 50 },
    quadrants: {
      ll: {
        code: 'team',
        name: '한 팀형',
        body: '같은 편이라는 감각이 살아 있고, 부딪혀도 대화로 돌아옵니다. 이 유형에서 할 일은 무언가를 고치는 것이 아니라, 지금 작동하고 있는 것이 무엇인지 알아 두는 것입니다.',
      },
      lh: {
        code: 'roommate',
        name: '룸메이트형',
        body: '다툼은 없지만 온도도 없습니다. 갈등 없음과 친밀함은 다른 것입니다. 이 유형은 조용해서 문제로 인식되지 않은 채 오래가고, 그러다 어느 날 갑자기 결론이 나는 쪽에 가깝습니다.',
      },
      hl: {
        code: 'overheat',
        name: '과열형',
        body: '마음은 남아 있는데 부딪히는 방식이 관계를 깎고 있습니다. 다행히도 방식만 바꿔도 크게 달라질 수 있는 유형입니다. 감정이 남아 있다는 것은 재료가 있다는 뜻입니다.',
      },
      hh: {
        code: 'burnout',
        name: '소진형',
        body: '부딪힘도, 붙잡을 마음도 함께 닳아 있습니다. 두 사람의 의지가 부족해서가 아니라, 이 정도로 얽힌 문제는 대개 둘만으로 풀기 어렵습니다. 혼자 애쓰기보다 전문가와 함께 보시기를 권합니다.',
      },
    },
  },
  questions: [
    // ── 스텝 1 · 지금의 결혼 ──────────────────────────────────────────
    {
      id: 'DD1',
      dim: 'SAT',
      step: 1,
      factor: 'SATISFACTION',
      text: '결혼 생활 전반에 대해, 나는 만족한다.',
      choices: AR,
    },
    {
      id: 'DD2',
      dim: 'SAT',
      step: 1,
      factor: 'RELATION_SATISFACTION',
      text: '{배우자}와 나의 관계에, 나는 만족한다.',
      choices: AR,
    },
    {
      id: 'DD3',
      dim: 'SAT',
      step: 1,
      factor: 'SPOUSE_SATISFACTION',
      text: '배우자로서의 {배우자}에게, 나는 만족한다.',
      choices: AR,
    },
    {
      id: 'DD4',
      dim: 'SAT',
      step: 1,
      factor: 'HOMECOMING_SCENE',
      text: '하루를 마치고 집에 들어가기 직전, 드는 기분에 가까운 것은?',
      choices: scene(
        ['편하다. 오늘 있었던 일을 이야기하고 싶다', 0],
        ['무덤덤하다', 2],
        ['집보다 차 안이나 밖이 편할 때가 있다', 3],
        ['들어가기 싫다는 생각을 자주 한다', 4],
      ),
    },
    {
      id: 'DD13',
      dim: 'DED',
      step: 1,
      factor: 'DED_LONGVIEW',
      text: '10년 뒤에도 이 사람 옆에 있는 내 모습이, 자연스럽게 그려진다.',
      choices: AR,
    },
    {
      id: 'DD14',
      dim: 'DED',
      step: 1,
      factor: 'DED_TEAM',
      text: '중요한 결정을 할 때, 나는 여전히 {배우자}와 한 팀이라고 느낀다.',
      choices: AR,
    },
    {
      id: 'DD15',
      dim: 'DED',
      step: 1,
      factor: 'DED_SACRIFICE',
      text: '{배우자}를 위해 내 일정이나 몫을 양보하는 일이, 아깝지 않다.',
      choices: AR,
    },
    {
      id: 'DD16',
      dim: 'DED',
      step: 1,
      factor: 'DED_EROSION',
      text: '요즘 나는 이 결혼을 "유지할지 말지"의 눈으로 바라보고 있다.',
      choices: A,
    },

    // ── 스텝 2 · 부딪히는 방식 ────────────────────────────────────────
    {
      id: 'DD5',
      dim: 'ADP',
      step: 2,
      factor: 'CON_CRITICISM',
      text: '지난 한 달 동안의 다툼에서, 벌어진 일이 아니라 사람 자체를 탓하는 말("당신은 원래 그래")이 — 어느 쪽에서든 — 나온 적이 있었나요?',
      choices: F,
    },
    {
      id: 'DD6',
      dim: 'ADP',
      step: 2,
      factor: 'CON_CONTEMPT',
      text: '지난 한 달 동안, 상대를 깎아내리는 말("그러니까 당신이 그 모양이지")이나 무시하는 표정·말투가 — 어느 쪽에서든 — 나온 적이 있었나요?',
      choices: F,
    },
    {
      id: 'DD7',
      dim: 'ADP',
      step: 2,
      factor: 'CON_DEFENSIVE',
      text: '잘못을 지적받으면, 나든 {배우자}든 사과보다 해명이나 맞지적("당신은 안 그랬어?")이 먼저 나오는 편이다.',
      choices: A,
    },
    {
      id: 'DD8',
      dim: 'ADP',
      step: 2,
      factor: 'CON_WITHDRAW',
      text: '한 사람이 집안 문제나 서운함을 꺼내면, 보통 어떻게 되나요?',
      choices: scene(
        ['길든 짧든 결국 대화가 된다', 0],
        ['미루긴 해도 이야기하게 된다', 1],
        ['한쪽이 입을 닫거나 자리를 뜬다', 3],
        ['꺼내던 쪽이 지쳐서, 이제는 꺼내지 않는다', 4],
      ),
    },
    {
      id: 'DD9',
      dim: 'ADP',
      step: 2,
      factor: 'CON_REPAIR',
      text: '말다툼이 커질 때 사과나 농담, "잠깐 쉬자" 같은 브레이크가 걸리면?',
      choices: scene(
        ['대체로 받아들여져 분위기가 꺾인다', 0],
        ['가끔은 통한다', 1],
        ['거의 무시되고 싸움이 이어진다', 3],
        ['그런 시도 자체가 사라졌다', 4],
      ),
    },
    {
      id: 'DD10',
      dim: 'ADP',
      step: 2,
      factor: 'CON_POSITIVE',
      text: '지난 한 달 동안, 고맙다는 말이나 칭찬, 다정한 농담을 주고받은 날이 얼마나 있었나요?',
      choices: P,
    },
    {
      id: 'DD11',
      dim: 'ADP',
      step: 2,
      factor: 'CON_FLOOD',
      text: '다툼이 시작되면 가슴이 뛰고 머리가 하얘져서, 그 자리를 벗어나고 싶어질 때가 있다.',
      choices: A,
    },
    {
      id: 'DD12',
      dim: 'ADP',
      step: 2,
      factor: 'CON_GRIDLOCK',
      text: '크게 다퉜던 문제는, 그 뒤에 보통 어떻게 되나요?',
      choices: scene(
        ['이야기가 마무리되어 같은 일로는 다시 안 싸운다', 0],
        ['봉합은 되는데 가끔 다시 나온다', 1],
        ['같은 문제로 몇 년째 반복해서 싸운다', 3],
        ['아예 꺼내면 안 되는 금지어가 됐다', 4],
      ),
    },

    // ── 스텝 3 · 현실의 압력 ──────────────────────────────────────────
    {
      id: 'DD23',
      dim: 'STR',
      step: 3,
      factor: 'STR_MONEY',
      text: '지난 한 달 동안, 돈 문제(소비, 분담, 계획)로 언성이 높아지거나 마음이 상한 적이 있었나요?',
      choices: F,
    },
    {
      id: 'DD24',
      dim: 'STR',
      step: 3,
      factor: 'STR_MONEY_STYLE',
      text: '돈 문제가 생기면, 두 사람은 보통 어떻게 하나요?',
      choices: scene(
        ['같이 들여다보고 같이 결정한다', 0],
        ['한 사람이 도맡고 다른 사람은 따른다', 1],
        ['각자 관리해서 서로 잘 모른다', 2],
        ['이야기 자체를 피한다. 꺼내면 싸움이 된다', 4],
      ),
    },
    {
      id: 'DD25',
      dim: 'STR',
      step: 3,
      factor: 'STR_PARENTING',
      text: '자녀 문제(교육, 훈육, 돌봄 분담)에 대해서는?',
      choices: scene(
        ['자녀가 없다', 0],
        ['방향이 비슷하고 분담도 그럭저럭 맞는다', 0],
        ['방향은 다르지만 조율은 된다', 1],
        ['한쪽에 쏠려 있고, 말해도 달라지지 않는다', 3],
        ['이 문제로 자주 싸운다', 4],
      ),
    },
    {
      id: 'DD26',
      dim: 'STR',
      step: 3,
      factor: 'STR_INLAWS',
      text: '지난 세 달 동안, 양가(시가·처가) 문제로 마음이 상한 일이 있었나요?',
      choices: F3,
    },
    {
      id: 'DD27',
      dim: 'STR',
      step: 3,
      factor: 'STR_ROLES',
      text: '집안일과 생활 운영의 분담에 대해, 나는?',
      choices: scene(
        ['대체로 공평하다고 느낀다', 0],
        ['가끔 불만이지만, 말하면 조정이 된다', 1],
        ['불공평하다고 느끼고, 말해도 소용이 없다', 3],
        ['말하기를 포기했다', 4],
      ),
    },
    {
      id: 'DD28',
      dim: 'STR',
      step: 3,
      factor: 'STR_INTIMACY',
      text: '부부 사이의 스킨십과 애정 표현은?',
      choices: scene(
        ['자연스럽게 있다', 0],
        ['예전보다 줄었지만 어색하진 않다', 1],
        ['거의 없고, 먼저 시도하기도 어색하다', 3],
        ['없어진 지 오래고, 서로 기대하지 않는다', 4],
      ),
    },
    {
      id: 'DD29',
      dim: 'VUL',
      step: 3,
      factor: 'VUL_ORIGIN',
      text: '나 또는 {배우자}가 자라며 겪은 일(부모의 갈등이나 이혼 등)이, 지금 우리 부부가 싸우는 방식에 영향을 주고 있다고 느낀다.',
      choices: A,
    },
    {
      id: 'DD30',
      dim: 'VUL',
      step: 3,
      factor: 'VUL_TEMPER',
      text: '스트레스가 쌓이면, 나 또는 {배우자}는 상대에게 날카로워지는 편이다.',
      choices: A,
    },
    {
      id: 'DD31',
      dim: 'VUL',
      step: 3,
      factor: 'VUL_WOUND',
      text: '과거의 큰 상처(외도, 거짓말, 금전 문제 등)에 대해서는?',
      choices: scene(
        ['그런 일이 없었다', 0],
        ['있었지만 정리가 됐다', 1],
        ['정리됐다고 말하지만, 가끔 되살아난다', 3],
        ['여전히 현재진행형이다', 4],
      ),
    },

    // ── 스텝 4 · 붙잡는 것과 여는 것 ──────────────────────────────────
    {
      id: 'DD17',
      dim: 'CNS',
      step: 4,
      factor: 'CNS_REASON',
      text: '만약 이혼을 가정해 본다면, 가장 먼저 걸리는 것은?',
      choices: scene(
        ['걸릴 것을 따질 것 없이, 애초에 그럴 생각이 없다', 0],
        ['{배우자}와 쌓아 온 시간과 정', 1],
        ['자녀, 양가, 주변의 시선', 3],
        ['경제적·현실적인 문제', 4],
      ),
    },
    {
      id: 'DD18',
      dim: 'CNS',
      step: 4,
      factor: 'CNS_CONDITIONAL',
      text: '자녀나 형편 같은 조건이 지금과 달랐다면, 이 결혼에 대한 내 선택은 달라졌을 것이다.',
      choices: A,
    },
    {
      id: 'DD19',
      dim: 'CNS',
      step: 4,
      factor: 'CNS_SOCIAL',
      text: '양가나 주변에서 우리 부부를 어떻게 볼지가, 결혼을 유지하는 이유 중 하나다.',
      choices: A,
    },
    {
      id: 'DD20',
      dim: 'ALT',
      step: 4,
      factor: 'ALT_VIABLE',
      text: '혼자 살게 되더라도, 내 생활은 그럭저럭 굴러갈 것 같다.',
      choices: A,
    },
    {
      id: 'DD21',
      dim: 'ALT',
      step: 4,
      factor: 'ALT_REHEARSE',
      text: '지난 세 달 동안, 이혼 후의 생활을 구체적으로 그려 본 적이 있었나요?',
      choices: F3,
    },
    {
      id: 'DD22',
      dim: 'ALT',
      step: 4,
      factor: 'ALT_BETTER',
      text: '지금의 결혼보다 나은 삶의 형태가 — 그것이 재혼이든 혼자든 — 있을 것 같다는 생각이 든다.',
      choices: A,
    },

    // ── 스텝 5 · 마지막 세 가지 ───────────────────────────────────────
    {
      id: 'DD32',
      dim: 'MSI',
      step: 5,
      factor: 'MSI_THINK',
      text: '이혼 생각에 대해서는?',
      choices: scene(
        ['진지하게 생각해 본 적 없다', 0],
        ['지나가듯 생각해 본 적 있다', 1],
        ['구체적으로, 반복해서 생각한다', 3],
        ['생각을 넘어 준비를 하고 있다', 4],
      ),
    },
    {
      id: 'DD33',
      dim: 'MSI',
      step: 5,
      factor: 'MSI_VOICE',
      text: '이혼이나 별거를 입 밖에 낸 적이 있나요?',
      choices: scene(
        ['없다', 0],
        ['다툼 중에 홧김에 나온 적 있다', 2],
        ['{배우자}와 진지하게 이야기한 적 있다', 3],
        ['별거 중이거나, 별거한 적이 있다', 4],
      ),
    },
    {
      id: 'DD34',
      dim: 'MSI',
      step: 5,
      factor: 'MSI_PREPARE',
      text: '이혼의 절차나 조건(재산 분할, 양육, 변호사 상담)을 알아본 적이 있나요?',
      choices: scene(
        ['없다', 0],
        ['기사나 방송에서 눈여겨본 정도', 1],
        ['내 경우를 구체적으로 검색해 봤다', 3],
        ['전문가와 상담했거나 서류를 준비해 봤다', 4],
      ),
    },
  ],
};
