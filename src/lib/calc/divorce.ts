import type { CalcConfig } from './types';

/**
 * 부부용 — 이혼 확률 계산기. 18문항 / 4스텝.
 *
 * The economy axis is weighted higher here than for dating couples: money
 * stops being a dating-cost question once two people share a household, a
 * loan and a plan. Trust gets its own axis because for married couples a
 * broken trust event is a direct cause rather than a background signal.
 */
export const divorce: CalcConfig = {
  type: 'divorce',
  path: '/divorce',
  name: '이혼 확률 계산기',
  title: '이혼 확률 계산기',
  intro:
    '18개의 질문으로 부부의 대화 방식, 살림, 신뢰를 차례로 짚어봅니다. 어느 부부에게나 흔들리는 시기는 있습니다. 중요한 것은 그 신호를 알아차리는 일입니다.',
  pronoun: { m: '아내', f: '남편', na: '배우자' },
  steps: [
    { title: '우리 부부의 조건', caption: '두 사람이 놓인 상황을 먼저 봅니다.' },
    { title: '부부의 대화 방식', caption: '결과를 가장 크게 좌우하는 부분입니다.' },
    { title: '돈과 살림', caption: '액수가 아니라, 다루는 방식을 묻습니다.' },
    { title: '신뢰와 마음', caption: '마지막 두 가지입니다.' },
  ],
  axes: [
    { key: 'behavior', label: '대화와 갈등', weight: 0.45 },
    { key: 'economy', label: '경제와 살림', weight: 0.25 },
    { key: 'structure', label: '부부의 조건', weight: 0.15 },
    { key: 'trust', label: '신뢰와 전망', weight: 0.15 },
  ],
  questions: [
    {
      id: 'B1',
      axis: 'structure',
      step: 1,
      text: '결혼한 지 얼마나 되셨나요?',
      choices: [
        { label: '4년 이하', score: 5 },
        { label: '5~9년', score: 4 },
        { label: '10~19년', score: 2 },
        { label: '20년 이상', score: 3 },
      ],
    },
    {
      id: 'B2',
      axis: 'structure',
      step: 1,
      text: '결혼을 결정하게 된 과정은?',
      choices: [
        { label: '충분히 교제하고 서로 확신이 있었다', score: 0 },
        { label: '교제 기간이 짧았다 (1년 미만)', score: 2 },
        { label: '임신 등 상황이 앞서서 결정됐다', score: 3 },
      ],
    },
    {
      id: 'B3',
      axis: 'structure',
      step: 1,
      text: '자녀는 어떻게 되나요?',
      choices: [
        { label: '미성년 자녀가 있다', score: 0 },
        { label: '자녀가 없다 (계획도 서로 일치)', score: 1 },
        { label: '자녀가 없고, 계획을 두고 생각이 다르다', score: 5 },
        { label: '자녀 문제(교육·양육 방식)로 자주 갈등한다', score: 4 },
      ],
    },
    {
      id: 'B4',
      axis: 'structure',
      step: 1,
      text: '시가·처가와의 관계는 어떤가요?',
      choices: [
        { label: '원만하다', score: 0 },
        { label: '가끔 불편하지만 넘어간다', score: 2 },
        { label: '명절·행사 때마다 갈등이 생긴다', score: 5 },
        { label: '갈등이 생기면 {배우자}가 내 편에 서지 않는다', score: 7 },
      ],
    },
    {
      id: 'B5',
      axis: 'structure',
      step: 1,
      text: '두 사람의 나이 차이는?',
      choices: [
        { label: '2살 이하', score: 0 },
        { label: '3~5살', score: 1 },
        { label: '6~9살', score: 2 },
        { label: '10살 이상', score: 4 },
      ],
    },
    {
      id: 'B6',
      axis: 'behavior',
      step: 2,
      text: '다툴 때 대화는 어떻게 시작되나요?',
      choices: [
        { label: '"이 일이 서운했다"처럼 사건을 이야기한다', score: 0 },
        { label: '"당신은 왜 맨날 그래"처럼 사람을 향할 때가 있다', score: 3 },
        { label: '거의 항상 인격·성격 비난으로 흐른다', score: 6 },
      ],
    },
    {
      id: 'B7',
      axis: 'behavior',
      step: 2,
      text: '서로를 향한 비웃음, 한숨, 무시, 비아냥이 있나요?',
      choices: [
        { label: '없다', score: 0 },
        { label: '드물게 있다', score: 4 },
        { label: '종종 있다', score: 8 },
        { label: '일상이 되었다', score: 10 },
      ],
    },
    {
      id: 'B8',
      axis: 'behavior',
      step: 2,
      text: '지적을 받으면 {배우자}(또는 나)는 어떻게 반응하나요?',
      choices: [
        { label: '일단 듣고, 인정할 건 인정한다', score: 0 },
        { label: '변명이나 해명이 먼저 나온다', score: 2 },
        { label: '"당신은 더하잖아"라며 맞받아친다', score: 5 },
      ],
    },
    {
      id: 'B9',
      axis: 'behavior',
      step: 2,
      text: '갈등 후의 침묵은 어느 정도인가요?',
      choices: [
        { label: '그날 안에 푼다', score: 0 },
        { label: '하루 이틀 서먹하다', score: 2 },
        { label: '며칠씩 말을 안 한다', score: 5 },
        { label: '며칠씩 각방을 쓰거나, 안 푼 채 쌓아둔다', score: 8 },
      ],
    },
    {
      id: 'B10',
      axis: 'behavior',
      step: 2,
      text: '부부간 애정 표현·스킨십은 어떤가요?',
      choices: [
        { label: '자연스럽게 이어지고 있다', score: 0 },
        { label: '예전보다 줄었지만 있다', score: 2 },
        { label: '거의 없어진 지 6개월 이상 됐다', score: 6 },
      ],
    },
    {
      id: 'B11',
      axis: 'behavior',
      step: 2,
      text: '하루에 부부가 나누는 대화는?',
      choices: [
        { label: '1시간 이상, 이런저런 이야기를 한다', score: 0 },
        { label: '30분 정도', score: 1 },
        { label: '10분이 안 된다', score: 4 },
        { label: '필요한 용건만 문자로 주고받는다', score: 6 },
      ],
    },
    {
      id: 'B12',
      axis: 'economy',
      step: 3,
      text: '가계 소득은 안정적인가요?',
      choices: [
        { label: '안정적이다', score: 0 },
        { label: '다소 불안하다', score: 2 },
        { label: '실직·사업 위기 등 큰 충격을 겪는 중이다', score: 4 },
      ],
    },
    {
      id: 'B13',
      axis: 'economy',
      step: 3,
      text: '소득·벌이에 대한 서로의 기대는 맞나요?',
      choices: [
        { label: '서로 만족하고 고마워한다', score: 0 },
        { label: '한쪽이 불만을 표현한 적 있다', score: 3 },
        { label: '이 문제로 갈등이 반복된다', score: 6 },
      ],
    },
    {
      id: 'B14',
      axis: 'economy',
      step: 3,
      text: '부채(대출) 상황은 어떤가요?',
      choices: [
        { label: '부채가 없거나, 계획 안에서 관리된다', score: 0 },
        { label: '감당 가능하지만 부담스럽다', score: 2 },
        { label: '부채 부담이 생활을 누른다', score: 4 },
        { label: '상대 몰래 생긴 빚이 있었다', score: 7 },
      ],
    },
    {
      id: 'B15',
      axis: 'economy',
      step: 3,
      text: '지금 사는 집은 부부에게 어떤 주제인가요?',
      choices: [
        { label: '만족하며 살고 있다', score: 0 },
        { label: '아쉽지만 계획이 있다', score: 1 },
        { label: '이사·내집마련 문제로 자주 예민해진다', score: 4 },
        { label: '집 문제로 서로를 탓한 적 있다', score: 6 },
      ],
    },
    {
      id: 'B16',
      axis: 'economy',
      step: 3,
      text: '부부의 돈 관리는 어떻게 하고 있나요?',
      choices: [
        { label: '합의된 방식으로 투명하게 관리한다', score: 0 },
        { label: '한쪽이 전담하지만 불만은 없다', score: 1 },
        { label: '각자 관리하고 서로 잘 모른다', score: 4 },
        { label: '돈 관리 문제로 자주 다툰다', score: 7 },
      ],
    },
    {
      id: 'B17',
      axis: 'trust',
      step: 4,
      text: '{배우자}에 대한 신뢰는 어떤가요?',
      choices: [
        { label: '의심해 본 적 없다', score: 0 },
        { label: '과거에 상처가 있었지만 회복 중이다', score: 3 },
        { label: '요즘 의심이 든다', score: 7 },
        { label: '실제로 신뢰가 깨진 일이 있었다', score: 10 },
      ],
    },
    {
      id: 'B18',
      axis: 'trust',
      step: 4,
      text: '"이혼"이라는 단어를 얼마나 떠올리나요?',
      choices: [
        { label: '떠올린 적 없다', score: 0 },
        { label: '홧김에 스친 적은 있다', score: 2 },
        { label: '진지하게 생각해 본 적 있다', score: 6 },
        { label: '별거나 상담 이야기가 오간 적 있다', score: 9 },
      ],
    },
  ],
};
