import type { AxisResult } from './calc/types';
import type { GradeCopy } from './calc/factors';

/**
 * Rendering helpers shared by the private result page and the shared-link page.
 * Kept as literal class strings so Tailwind sees them when it scans sources.
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
 * Bars are coloured by value, not by axis, so the same colour always means the
 * same level of concern across every chart on the site.
 */
function barClass(value: number): string {
  if (value >= 80) return 'bg-clay';
  if (value >= 60) return 'bg-amber';
  if (value >= 35) return 'bg-ink-faint';
  return 'bg-sage';
}

export function renderAxes(target: HTMLElement, axes: AxisResult[]): void {
  target.innerHTML = '';
  axes.forEach((axis, i) => {
    const row = document.createElement('div');
    row.className = 'settle';
    row.style.animationDelay = `${i * 70}ms`;
    row.innerHTML = `
      <div class="flex items-baseline justify-between gap-4">
        <dt class="text-[0.9375rem]"></dt>
        <dd class="text-[0.8125rem] text-ink-faint nums"></dd>
      </div>
      <div class="mt-2 h-1.5 w-full overflow-hidden border-l border-rule">
        <div data-fill class="h-1.5 ${barClass(axis.value)} transition-[width] duration-700 ease-out" style="width:0%"></div>
      </div>`;
    const dt = row.querySelector('dt')!;
    dt.textContent = axis.label;
    row.querySelector('dd')!.textContent = `${axis.value} · 비중 ${Math.round(axis.weight * 100)}%`;
    target.appendChild(row);

    const fill = row.querySelector<HTMLElement>('[data-fill]')!;
    // Paint on the next frame so the width transition actually runs.
    requestAnimationFrame(() => {
      fill.style.width = `${axis.value}%`;
    });
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
