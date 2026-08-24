import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Renders the Open Graph cards once, into public/og/.
 *
 * The output is committed to the repository on purpose: SVG text rendering
 * depends on the fonts installed on the machine doing the rendering, so
 * generating these during CI or on a teammate's laptop would quietly produce
 * different images. Run `npm run og` only when the cards actually change.
 */

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/og');

const PAPER = '#f7f5f1';
const INK = '#191714';
const INK_SOFT = '#57514a';
const FAINT = '#8c847a';
const CLAY = '#a8523c';
const RULE = '#ddd7cd';

/** Whatever Korean serif the rendering machine has, in order of preference. */
const SERIF = 'Nanum Myeongjo, Batang, Malgun Gothic, serif';
const SANS = 'Malgun Gothic, Pretendard, sans-serif';

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function card({ eyebrow, headline, sub, meta }) {
  const lines = headline.split('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <circle cx="215" cy="76" r="330" fill="${CLAY}" opacity="0.035"/>
  <circle cx="1010" cy="560" r="300" fill="#55704f" opacity="0.03"/>
  <rect x="72" y="72" width="1056" height="486" fill="none" stroke="${RULE}" stroke-width="1"/>

  <text x="120" y="152" font-family="${SANS}" font-size="20" letter-spacing="4"
        fill="${FAINT}">${escape(eyebrow)}</text>

  ${lines
    .map(
      (line, i) =>
        `<text x="118" y="${262 + i * 82}" font-family="${SERIF}" font-size="70" font-weight="700"
        fill="${INK}">${escape(line)}</text>`,
    )
    .join('\n  ')}

  <text x="120" y="${300 + lines.length * 82}" font-family="${SANS}" font-size="27"
        fill="${INK_SOFT}">${escape(sub)}</text>

  <line x1="120" y1="482" x2="1080" y2="482" stroke="${RULE}" stroke-width="1"/>
  <text x="120" y="524" font-family="${SANS}" font-size="22" fill="${FAINT}">${escape(meta)}</text>
  <text x="1080" y="524" text-anchor="end" font-family="${SANS}" font-size="22"
        fill="${CLAY}">love.mycarebom.com</text>
</svg>`;
}

const CARDS = {
  default: {
    eyebrow: 'RELATIONSHIP RISK INDEX',
    headline: '우리, 괜찮은 걸까요?',
    sub: '관계 연구에 기반한 질문으로 지금의 위험 신호를 담담하게 짚어봅니다.',
    meta: '연인 · 부부 · 황혼 · 무료 자가진단',
  },
  breakup: {
    eyebrow: '연인',
    headline: '헤어질 확률 계산기',
    sub: '요즘 자주 다투거나, 마음이 예전 같지 않다면.',
    meta: '16문항 · 약 3분 · 회원가입 없음',
  },
  divorce: {
    eyebrow: '부부',
    headline: '이혼 확률 계산기',
    sub: '말수가 줄고, 같은 문제로 반복해서 부딪히고 있다면.',
    meta: '18문항 · 약 4분 · 회원가입 없음',
  },
  twilight: {
    eyebrow: '황혼',
    headline: '황혼 이혼 계산기',
    sub: '은퇴 이후, 하루 종일 마주하게 된 두 사람이라면.',
    meta: '15문항 · 약 3분 · 회원가입 없음',
  },
};

await mkdir(OUT, { recursive: true });

for (const [name, spec] of Object.entries(CARDS)) {
  const svg = card(spec);
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(OUT, `${name}.png`), png);
  console.log(`og/${name}.png  ${(png.length / 1024).toFixed(0)}KB`);
}
