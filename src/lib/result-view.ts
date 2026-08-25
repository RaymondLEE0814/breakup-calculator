import type { DimResult, InteractionResult } from './calc/types';
import type { GradeCopy } from './calc/factors';

/**
 * Rendering helpers shared by the private result pages and the shared-link
 * page. Class strings are literals so Tailwind sees them when it scans source.
 */

export function toneClasses(tone: GradeCopy['tone']): string {
  switch (tone) {
    case 'sage':
      return 'border-sage text-sage';
    case 'amber':
      return 'border-amber text-amber';
    case 'clay':
      return 'border-clay text-clay';
    default:
      return 'border-rule text-ink-soft';
  }
}

/**
 * Bars are coloured by value, not by dimension, so the same colour always
 * means the same level of concern anywhere on the site.
 */
function barClass(value: number): string {
  if (value >= 80) return 'bg-clay';
  if (value >= 60) return 'bg-amber';
  if (value >= 35) return 'bg-ink-faint';
  return 'bg-sage';
}

/** Level-only rows are neutral: a high constraint score is not a bad score. */
const NEUTRAL_BAR = 'bg-ink-faint';

export function renderDims(target: HTMLElement, dims: DimResult[]): void {
  target.innerHTML = '';
  dims.forEach((dim, i) => {
    const row = document.createElement('div');
    row.className = 'settle';
    row.style.animationDelay = `${i * 60}ms`;
    const fillClass = dim.levelOnly ? NEUTRAL_BAR : barClass(dim.value);
    const shown = dim.effective !== dim.value ? dim.effective : dim.value;
    row.innerHTML = `
      <div class="flex items-baseline justify-between gap-4">
        <dt class="text-[0.9375rem]"></dt>
        <dd class="text-[0.8125rem] text-ink-faint nums"></dd>
      </div>
      <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rule-soft">
        <div data-fill class="h-1.5 rounded-full ${fillClass} transition-[width] duration-700 ease-out" style="width:0%"></div>
      </div>
      <p class="mt-1.5 text-[0.8125rem] text-ink-faint"></p>`;

    row.querySelector('dt')!.textContent = dim.label;
    row.querySelector('dd')!.textContent = dim.levelOnly
      ? `${shown} · 지수에 직접 반영 안 함`
      : `${shown} · 비중 ${Math.round(dim.weight * 100)}%`;

    const note = row.querySelector('p')!;
    if (dim.note) {
      note.textContent =
        dim.effective !== dim.value
          ? `${dim.note} · 응답 ${dim.value}, 모형 보정 후 ${dim.effective}`
          : dim.note;
    } else {
      note.remove();
    }

    target.appendChild(row);

    const fill = row.querySelector<HTMLElement>('[data-fill]')!;
    // Paint on the next frame so the width transition actually runs.
    requestAnimationFrame(() => {
      fill.style.width = `${shown}%`;
    });
  });
}

/**
 * Interaction terms get their own cards rather than bars.
 *
 * They are products of two dimensions, so they cannot be decomposed back to
 * individual answers the way the linear terms can — presenting one as "your
 * score in X" would be a lie about what it measures.
 */
export function renderInteractions(target: HTMLElement, items: InteractionResult[]): void {
  target.innerHTML = '';
  // Below this the term is not doing meaningful work and the card would just
  // be noise on an otherwise calm result.
  const notable = items.filter((item) => item.value >= 25);
  if (notable.length === 0) {
    target.hidden = true;
    return;
  }
  target.hidden = false;
  notable.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'rounded-xl border border-rule bg-paper-raised p-4';
    card.innerHTML = `
      <p class="flex items-baseline justify-between gap-3">
        <span class="text-[0.9375rem] font-semibold"></span>
        <span class="text-[0.8125rem] text-ink-faint nums"></span>
      </p>
      <p class="mt-2 text-[0.875rem] leading-relaxed text-ink-soft"></p>`;
    const [head, body] = card.getElementsByTagName('p');
    head.firstElementChild!.textContent = item.label;
    head.lastElementChild!.textContent = String(item.value);
    body.textContent = item.note;
    target.appendChild(card);
  });
}

/** A slow, quiet count. No easing theatrics — the number is the point. */
export function countUp(target: HTMLElement, value: number, duration = 750): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.textContent = String(value);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    target.textContent = String(Math.round(value * eased));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
