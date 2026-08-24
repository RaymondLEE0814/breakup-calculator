import type { CalcConfig } from './types';

/**
 * 황혼용 — 황혼 이혼 계산기. 15문항 / 4스텝.
 *
 * This one carries an axis the other two do not: retirement, caregiving load
 * and the renegotiation of household roles. Those are the pressures specific
 * to a couple who suddenly share twenty-four hours a day after decades of
 * sharing two or three. The behaviour axis weighs slightly less here — not
 * because it matters less, but because the later-life axis takes real weight
 * and the accumulated-hurt question (C7) already sits inside behaviour.
 */
export const twilight: CalcConfig = {
  type: 'twilight',
  path: '/twilight',
  name: '황혼 이혼 계산기',
  title: '황혼 이혼 계산기',
  intro:
    '결혼 20년, 30년. 오래 함께한 부부에게는 오래된 부부만의 질문이 필요합니다. 15개의 질문으로 은퇴 이후의 두 사람을 점검해 봅니다.',
  pronoun: { m: '아내', f: '남편', na: '배우자' },
  steps: [
    { title: '우리의 시간', caption: '함께한 세월부터 봅니다.' },
    { title: '오래된 습관', caption: '오래된 부부일수록 말투가 굳어집니다.' },
    { title: '은퇴 후의 하루', caption: '이 시기 부부만의 질문입니다.' },
    { title: '노후의 준비', caption: '마지막 세 가지입니다.' },
  ],
  axes: [
    { key: 'behavior', label: '대화와 존중', weight: 0.35 },
    { key: 'later', label: '은퇴와 돌봄', weight: 0.25 },
    { key: 'economy', label: '노후 자금', weight: 0.2 },
    { key: 'structure', label: '함께한 시간', weight: 0.1 },
    { key: 'outlook', label: '마음과 전망', weight: 0.1 },
  ],
  questions: [
    {
      id: 'C1',
      axis: 'structure',
      step: 1,
      text: '결혼한 지 얼마나 되셨나요?',
      choices: [
        { label: '20년 미만', score: 3 },
        { label: '20~29년', score: 2 },
        { label: '30년 이상', score: 2 },
      ],
    },
    {
      id: 'C2',
      axis: 'structure',
      step: 1,
      text: '자녀들은 독립했나요?',
      choices: [
        { label: '아직 함께 산다', score: 0 },
        { label: '일부 독립했다', score: 1 },
        { label: '모두 독립했다', score: 3 },
      ],
    },
    {
      id: 'C3',
      axis: 'structure',
      step: 1,
      text: '은퇴 상황은 어떤가요?',
      choices: [
        { label: '둘 다(혹은 외벌이가) 아직 일하고 있다', score: 0 },
        { label: '한 사람이 은퇴해 적응 중이다', score: 2 },
        { label: '둘 다 은퇴했고, 잘 적응하고 있다', score: 3 },
        { label: '은퇴 후 집안에서의 역할을 두고 부딪힌다', score: 6 },
      ],
    },
    {
      id: 'C4',
      axis: 'behavior',
      step: 2,
      text: '부부가 하루에 나누는 대화는?',
      choices: [
        { label: '1시간 이상', score: 0 },
        { label: '30분 정도', score: 2 },
        { label: '10분이 안 된다', score: 5 },
        { label: 'TV는 같이 보지만 대화는 없다', score: 7 },
      ],
    },
    {
      id: 'C5',
      axis: 'behavior',
      step: 2,
      text: '"말해도 소용없다"는 마음이 드나요? (무시·묵살 포함)',
      choices: [
        { label: '아니다, 여전히 이야기한다', score: 0 },
        { label: '가끔 그렇다', score: 3 },
        { label: '자주 그렇다', score: 7 },
        { label: '서로 없는 사람처럼 지낸다', score: 10 },
      ],
    },
    {
      id: 'C6',
      axis: 'behavior',
      step: 2,
      text: '고맙다·수고했다 같은 말을 주고받나요?',
      choices: [
        { label: '자주 한다', score: 0 },
        { label: '가끔 한다', score: 2 },
        { label: '언제 했는지 기억나지 않는다', score: 5 },
      ],
    },
    {
      id: 'C7',
      axis: 'behavior',
      step: 2,
      text: '지난 세월의 상처(외도, 폭언, 무관심 등)는 어떤 상태인가요?',
      choices: [
        { label: '그런 일이 없거나, 풀고 넘어왔다', score: 0 },
        { label: '풀리지 않은 채 남아 있다', score: 5 },
        { label: '지금도 그 이야기가 나오면 싸움이 된다', score: 8 },
      ],
    },
    {
      id: 'C8',
      axis: 'behavior',
      step: 2,
      text: '생활 공간은 어떻게 쓰고 있나요?',
      choices: [
        { label: '함께 생활한다', score: 0 },
        { label: '각방을 쓴다 (수면 문제 등 합의된 이유)', score: 1 },
        { label: '식사·생활이 거의 따로다', score: 5 },
        { label: '사실상 별거에 가깝다', score: 8 },
      ],
    },
    {
      id: 'C9',
      axis: 'later',
      step: 3,
      text: '건강과 돌봄은 어떤 상황인가요?',
      choices: [
        { label: '둘 다 건강한 편이다', score: 0 },
        { label: '한쪽에 지병이 있지만 함께 관리한다', score: 2 },
        { label: '돌봄 부담이 한 사람에게 몰려 있다', score: 6 },
        { label: '돌봄 문제로 갈등이 깊다', score: 8 },
      ],
    },
    {
      id: 'C10',
      axis: 'later',
      step: 3,
      text: '각자의 하루는 어떻게 채워지나요?',
      choices: [
        { label: '각자 취미·모임·사회활동이 있다', score: 0 },
        { label: '한 사람만 바깥 활동이 있다', score: 3 },
        { label: '둘 다 집에만 있어 자주 부딪힌다', score: 5 },
      ],
    },
    {
      id: 'C11',
      axis: 'later',
      step: 3,
      text: '은퇴 이후 집안일 분담은?',
      choices: [
        { label: '상황에 맞게 함께 조정했다', score: 0 },
        { label: '예전 그대로지만 큰 불만은 없다', score: 1 },
        { label: '한 사람이 도맡고 있고, 불만이 쌓인다', score: 5 },
      ],
    },
    {
      id: 'C12',
      axis: 'later',
      step: 3,
      text: '자녀 지원·상속·양가 문제 같은 큰 결정에서 의견이 맞나요?',
      choices: [
        { label: '대체로 맞는다', score: 0 },
        { label: '가끔 부딪힌다', score: 2 },
        { label: '반복해서 크게 갈등한다', score: 5 },
      ],
    },
    {
      id: 'C13',
      axis: 'economy',
      step: 4,
      text: '노후 자금(연금 포함) 준비는 어떤가요?',
      choices: [
        { label: '부부가 함께 세운 계획이 있다', score: 0 },
        { label: '준비는 했지만 불안하다', score: 2 },
        { label: '준비가 부족하고 계획도 없다', score: 5 },
        { label: '노후 자금 문제로 다툰 적 있다', score: 7 },
      ],
    },
    {
      id: 'C14',
      axis: 'economy',
      step: 4,
      text: '부부의 재산·돈 흐름을 서로 알고 있나요?',
      choices: [
        { label: '투명하게 공유한다', score: 0 },
        { label: '한쪽이 관리하지만 합의된 방식이다', score: 1 },
        { label: '서로의 재산 상황을 잘 모른다', score: 4 },
        { label: '숨겨둔 돈 문제로 갈등한 적 있다', score: 7 },
      ],
    },
    {
      id: 'C15',
      axis: 'outlook',
      step: 4,
      text: '"졸혼"이나 "이혼"이라는 말을 떠올려 본 적 있나요?',
      choices: [
        { label: '없다', score: 0 },
        { label: '농담처럼 해본 적 있다', score: 2 },
        { label: '진지하게 생각해 봤다', score: 6 },
        { label: '실제로 이야기가 오간 적 있다', score: 9 },
      ],
    },
  ],
};
