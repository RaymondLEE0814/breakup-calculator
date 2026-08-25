import type { CalcConfig, CalcResult, DimResult } from './calc/types';

/**
 * What to offer a married couple after their result.
 *
 * Three rules shape everything here.
 *
 * 1. **Counselling never disappears.** Whatever the index says, the card
 *    offering to talk to someone stays on the page. A calculator that reaches
 *    a high number and then only offers a lawyer is pushing, and this one does
 *    not push.
 * 2. **Nothing branches under the screener's own margin of error.** A seven-item
 *    test carries ±7; between 45 and 54 that band straddles the boundary, and
 *    deciding someone's next move on it would claim precision the instrument
 *    does not have. That range gets the deep dive instead.
 * 3. **Violence withdraws the branch entirely.** Couples counselling can put
 *    someone in danger, and asking a person who has been hurt to apportion
 *    fault invites them to blame themselves. Where the safety question fired,
 *    the result page shows help lines and nothing else.
 */

interface Card {
  eyebrow: string;
  title: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** Rendered as a quiet line rather than a card. */
  quiet?: boolean;
}

const source = (config: CalcConfig) => `?from=${config.type}`;

function counsellingCard(config: CalcConfig, lead: string, body: string): Card {
  return {
    eyebrow: '부부상담',
    title: lead,
    body,
    primary: { href: `/counseling${source(config)}`, label: '부부상담 신청하기' },
  };
}

function legalCard(config: CalcConfig, quiet: boolean): Card {
  if (quiet) {
    return {
      eyebrow: '법률 정보',
      title: '법률적인 부분이 궁금해지기 시작했다면',
      body: '이혼 과실(유책) 비율 계산기에서 파탄의 책임이 어느 쪽에 얼마나 실려 있는지 먼저 정리해 볼 수 있습니다. 5분이 걸리고, 답변은 저장되지 않습니다.',
      secondary: { href: '/divorce/fault', label: '과실 비율 계산기 보기' },
      quiet: true,
    };
  }
  return {
    eyebrow: '법률 정보',
    title: '법률 정보가 필요한 단계라면',
    body: '이 결과는 이혼을 권하는 것이 아닙니다. 다만 절차나 조건을 이미 알아보기 시작하셨다면, 감정이 아니라 정보로 준비하는 편이 낫습니다. 과실(유책) 비율 계산기는 재판상 이혼에서 다뤄지는 사유들을 기준으로, 파탄의 책임이 나와 상대 중 어느 쪽에 얼마나 실려 있는지를 정리해 봅니다. 결과는 법률 판단이 아니며, 법률 상담을 신청하실 때 이야기를 정리하는 용도입니다.',
    primary: { href: '/divorce/fault', label: '과실 비율 계산기 하기 · 약 5분' },
    secondary: { href: `/legal${source(config)}`, label: '바로 법률 상담 신청하기' },
  };
}

/** The loudest weighted dimension, when one stands out on an otherwise calm result. */
function standoutDim(result: CalcResult): DimResult | null {
  const weighted = result.dims.filter((d) => d.weight > 0);
  const top = weighted.reduce<DimResult | null>(
    (hi, d) => (!hi || d.effective > hi.effective ? d : hi),
    null,
  );
  return top && top.effective >= 60 ? top : null;
}

function cardsFor(config: CalcConfig, result: CalcResult): Card[] {
  const isSimple = config.depth === 'simple';

  // Rule 2 — the screener does not branch inside its own margin.
  if (isSimple && result.index >= 45 && result.index <= 54) {
    return [
      {
        eyebrow: '더 자세히',
        title: '지금 결과는 경계선 위에 있습니다',
        body: '빠른 검사는 ±7의 폭을 가진 선별 검사입니다. 지금 지수는 그 폭이 경계를 걸치는 자리에 있어서, 이 결과만으로 다음 걸음을 정하기는 이릅니다. 심화 진단이 이 숫자가 어디에서 왔는지를 나눠서 보여 드립니다.',
        primary: { href: `/${config.family}/deep`, label: '심화 진단 하기' },
      },
    ];
  }

  if (result.grade === 'stable') {
    return [
      {
        eyebrow: '다음 단계',
        title: '지금 상태를 더 단단히 하고 싶다면',
        body: '지금 결과에는 붙잡아야 할 신호가 거의 없습니다. 그래도 한 번 점검받아 보고 싶으시다면, 부부상담을 신청하실 수 있습니다.',
        secondary: { href: `/counseling${source(config)}`, label: '부부상담 신청' },
        quiet: true,
      },
    ];
  }

  if (result.grade === 'check') {
    const standout = standoutDim(result);
    const card = standout
      ? counsellingCard(
          config,
          `전체는 안정적인데, "${standout.label}" 한 곳이 높습니다`,
          `지수를 끌어올릴 정도는 아니지만, ${standout.label} 축이 다른 축보다 뚜렷하게 높게 나왔습니다. 이런 프로필은 한 가지 주제만 다뤄도 달라지는 경우가 많아서, 짧은 상담으로도 효과를 보기 좋은 모양입니다.`,
        )
      : counsellingCard(
          config,
          '큰 신호는 없습니다. 그래서 지금이 좋은 시점입니다',
          '지금 결과에는 관계를 흔들 만한 구조적 신호가 보이지 않습니다. 상담은 문제가 커진 뒤에 받는 것이라고 생각하기 쉽지만, 실제로는 반대에 가깝습니다 — 패턴이 굳기 전의 상담이 가장 가볍고, 가장 오래 갑니다.',
        );
    return [card];
  }

  const counselling = counsellingCard(
    config,
    config.family === 'twilight'
      ? '수십 년을 함께한 관계일수록, 제3자와 함께 보는 것이 빠릅니다'
      : '이 지수에서 가장 검증된 다음 걸음은 상담입니다',
    '지금 결과에는 두 사람만으로 풀기 어려운 패턴이 보입니다. 의지가 부족해서가 아니라, 이 정도로 얽힌 문제는 대개 제3자의 눈이 필요합니다. 결과지의 차원 점수를 들고 가면 상담이 훨씬 빨리 본론에 들어갑니다.',
  );

  if (result.grade === 'caution') {
    return [counselling, legalCard(config, true)];
  }

  // Warning. Order depends on what kind of warning it is.
  const code = result.type?.code;
  // Feelings still present — the pattern is the problem, and patterns change.
  const stillWarm = code === 'overheat' || code === 'duty';
  const flaggedOnly = Boolean(result.flag) && result.indexBeforeFlag < 50;

  if (stillWarm) {
    return [
      {
        ...counselling,
        body: '지수는 높지만, 이 유형은 방식만 바꿔도 크게 달라질 수 있는 유형입니다. 마음이 남아 있을 때의 상담과 다 닳은 뒤의 상담은 다릅니다. ' + counselling.body,
      },
      legalCard(config, true),
    ];
  }

  if (flaggedOnly) {
    return [
      {
        eyebrow: '먼저 알아 두실 것',
        title: '지수를 끌어올린 것은 관계의 구조가 아니라 이미 움직인 걸음입니다',
        body: '차원별 점수는 그리 높지 않은데, 이혼을 향해 실제로 움직인 응답이 지수를 끌어올렸습니다. 두 가지 길을 모두 열어 둡니다.',
        quiet: true,
      },
      counselling,
      legalCard(config, false),
    ];
  }

  return [counselling, legalCard(config, false)];
}

export function renderBranch(config: CalcConfig, result: CalcResult): void {
  const target = document.getElementById('result-branch');
  if (!target) return;

  // Rule 3 — no branch at all where violence or coercive control was reported.
  if (result.safetyTriggered) {
    target.innerHTML = '';
    return;
  }

  target.innerHTML = '';
  for (const card of cardsFor(config, result)) {
    const el = document.createElement('section');
    el.className = card.quiet
      ? 'rounded-2xl border border-rule-soft p-5'
      : 'surface-card p-6 sm:p-9';
    el.innerHTML = `
      <p class="gutter-label"></p>
      <h2 class="mt-3 ${card.quiet ? 'text-[1.0625rem] font-semibold' : 'text-[1.375rem]'}"></h2>
      <p class="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft"></p>
      <div class="mt-6 flex flex-col gap-2 sm:flex-row"></div>`;
    el.querySelector('p')!.textContent = card.eyebrow;
    el.querySelector('h2')!.textContent = card.title;
    el.getElementsByTagName('p')[1].textContent = card.body;

    const actions = el.querySelector('div')!;
    if (card.primary) {
      const a = document.createElement('a');
      a.href = card.primary.href;
      a.className = 'button-primary text-center';
      a.textContent = card.primary.label;
      actions.appendChild(a);
    }
    if (card.secondary) {
      const a = document.createElement('a');
      a.href = card.secondary.href;
      a.className = card.quiet
        ? 'text-[0.9375rem] text-clay underline underline-offset-[3px]'
        : 'button-secondary text-center';
      a.textContent = card.secondary.label;
      actions.appendChild(a);
    }
    if (!card.primary && !card.secondary) actions.remove();

    target.appendChild(el);
  }
}
