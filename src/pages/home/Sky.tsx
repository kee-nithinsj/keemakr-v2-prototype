import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import type { ThemeName } from '@/components/shell/shell-context';

export type SkyName = 'sun' | 'cloud' | 'rain' | 'night';

export const SKY_LABEL: Record<SkyName, string> = {
  sun: 'Sunny, 68°',
  cloud: 'Foggy, 61°',
  rain: 'Light rain, 56°',
  night: 'Clear night, 54°',
};

const ORDER: SkyName[] = ['sun', 'cloud', 'rain', 'night'];
export const nextSky = (s: SkyName) => ORDER[(ORDER.indexOf(s) + 1) % ORDER.length] ?? 'sun';

type Paint = {
  sky: string; far: string; near: string; wall: string; roof: string; door: string;
  win: string; tree: string; trunk: string; cloud: string; cloud2: string;
};

const LIGHT: Record<SkyName, Paint> = {
  sun: { sky: '#dce8ef', far: '#cbd7c8', near: '#bccab7', wall: '#ece7df', roof: '#b08d7b', door: '#8e7a6e', win: '#c6d2d9', tree: '#a5b69e', trunk: '#8d7e71', cloud: '#ffffff', cloud2: '#eef3f6' },
  cloud: { sky: '#e2e5e9', far: '#d0d6cf', near: '#c3cbc1', wall: '#e6e3de', roof: '#a39184', door: '#877a71', win: '#c8cdd2', tree: '#a8b3a4', trunk: '#8a8079', cloud: '#f7f8f9', cloud2: '#eaedf0' },
  rain: { sky: '#d0d6dd', far: '#bfc7c1', near: '#b1bab3', wall: '#d9d6d2', roof: '#8f8179', door: '#776c66', win: '#bcc3ca', tree: '#97a597', trunk: '#7a716b', cloud: '#b9c1cb', cloud2: '#c6cdd5' },
  night: { sky: '#1e2531', far: '#252d39', near: '#1a2029', wall: '#2e3643', roof: '#3a4350', door: '#222832', win: '#29303b', tree: '#253030', trunk: '#2b333e', cloud: '#2b3340', cloud2: '#2b3340' },
};
const DARK: Record<SkyName, Paint> = {
  sun: { sky: '#1f272e', far: '#253029', near: '#1e2621', wall: '#3a3631', roof: '#554239', door: '#2c2622', win: '#2f363c', tree: '#2c3a2c', trunk: '#3a322c', cloud: '#3a434c', cloud2: '#2f373f' },
  cloud: { sky: '#202326', far: '#262b27', near: '#1f2320', wall: '#35332f', roof: '#4a3f38', door: '#2a2522', win: '#2e3236', tree: '#2b332b', trunk: '#37302b', cloud: '#3b4046', cloud2: '#30353a' },
  rain: { sky: '#1b1f25', far: '#22272a', near: '#1b1f21', wall: '#302f2d', roof: '#403833', door: '#252220', win: '#2a2e33', tree: '#252c27', trunk: '#322c28', cloud: '#353b43', cloud2: '#2c3138' },
  night: { sky: '#161b23', far: '#1c222b', near: '#14181f', wall: '#252c36', roof: '#2f3742', door: '#1a1f27', win: '#20262f', tree: '#1d2626', trunk: '#232a33', cloud: '#222934', cloud2: '#222934' },
};

function seeded(start: number) {
  let s = start;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const rand = seeded(7);
const STARS = Array.from({ length: 28 }, () => ({
  cx: rand() * 2400, cy: 8 + rand() * 92, r: 0.7 + rand() * 0.8, d: rand() * 3.4,
}));
const DROPS = Array.from({ length: 140 }, () => {
  const x = rand() * 2400;
  const y = 60 + rand() * 50;
  return { x, y, d: rand() };
});

const fill = 'transition-[fill] duration-700 ease-kee';
const box: CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center' };

function Cloud({ x, y, s, delay, tone }: { x: number; y: number; s: number; delay: number; tone: 'cloud' | 'cloud2' }) {
  const paint = tone === 'cloud' ? 'fill-[var(--c-cloud)]' : 'fill-[var(--c-cloud2)]';
  return (
    <g className="animate-drift motion-reduce:animate-none" style={{ animationDelay: `${-delay}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle className={cx(paint, fill)} cx="9" cy="9" r="9" />
        <circle className={cx(paint, fill)} cx="22" cy="3" r="12" />
        <circle className={cx(paint, fill)} cx="35" cy="9" r="9" />
        <rect className={cx(paint, fill)} x="9" y="9" width="26" height="9" />
      </g>
    </g>
  );
}

function Tree({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect className={cx('fill-[var(--c-trunk)]', fill)} x="-1.5" y="4" width="3" height="22" />
      <circle className={cx('fill-[var(--c-tree)]', fill)} cx="0" cy="0" r="10" />
      <circle className={cx('fill-[var(--c-tree)]', fill)} cx="-6" cy="6" r="6" />
    </g>
  );
}

export function Sky({ sky, theme, onCycle }: { sky: SkyName; theme: ThemeName; onCycle: () => void }) {
  const paint = (theme === 'light' ? LIGHT : DARK)[sky];
  const vars = {
    '--c-sky': paint.sky, '--c-far': paint.far, '--c-near': paint.near, '--c-wall': paint.wall,
    '--c-roof': paint.roof, '--c-door': paint.door, '--c-win': paint.win, '--c-tree': paint.tree,
    '--c-trunk': paint.trunk, '--c-cloud': paint.cloud, '--c-cloud2': paint.cloud2,
  } as CSSProperties;
  const show = (on: boolean, extra = '') => cx('transition-opacity duration-700 ease-kee', on ? (extra || 'opacity-100') : 'opacity-0');
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return { x1: 420 + Math.cos(a) * 29, y1: 58 + Math.sin(a) * 29, x2: 420 + Math.cos(a) * 36, y2: 58 + Math.sin(a) * 36 };
  });
  const lit = sky === 'night' || sky === 'rain';

  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Weather in San Francisco: ${SKY_LABEL[sky]}. Change the weather`}
      className="mb-5 block h-[168px] w-full shrink-0 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-line focus-visible:-outline-offset-1"
    >
      <svg viewBox="0 0 2400 180" preserveAspectRatio="xMidYMax slice" className="block h-full w-full" style={vars} aria-hidden>
        <defs>
          <filter id="sky-soften" x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <rect className={cx('fill-[var(--c-sky)]', fill)} width="2400" height="180" />
        <g className={show(sky === 'night')}>
          {STARS.map((star, i) => (
            <circle key={i} className="animate-twinkle fill-[#b9c2d0] motion-reduce:animate-none" style={{ animationDelay: `${-star.d}s` }} cx={star.cx} cy={star.cy} r={star.r} />
          ))}
        </g>
        <g className={show(sky === 'cloud' || sky === 'rain')}>
          <Cloud x={110} y={36} s={1.2} delay={110 % 13} tone="cloud2" />
          <Cloud x={2060} y={28} s={1.3} delay={2060 % 13} tone="cloud2" />
          <Cloud x={2260} y={56} s={1} delay={2260 % 13} tone="cloud2" />
        </g>
        <g className={show(sky === 'sun' || sky === 'cloud' || sky === 'rain' || sky === 'night', sky === 'sun' ? 'opacity-90' : sky === 'night' ? 'opacity-80' : '')}>
          <Cloud x={320} y={62} s={1} delay={320 % 13} tone="cloud" />
          <Cloud x={1900} y={64} s={1.1} delay={1900 % 13} tone="cloud" />
        </g>
        <g transform="translate(600 0)">
          <g className={cx(show(sky === 'sun' || sky === 'cloud'), 'transition-transform duration-700 ease-kee', sky === 'cloud' && 'translate-x-[14px] translate-y-2')}>
            <g className="animate-spin-slow motion-reduce:animate-none" style={box}>
              {rays.map((r, i) => (
                <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} className={theme === 'dark' ? 'stroke-[#df9a36]' : 'stroke-[#f2b04a]'} strokeWidth="3" strokeLinecap="round" />
              ))}
            </g>
            <circle cx="420" cy="58" r="22" className={theme === 'dark' ? 'fill-[#df9a36]' : 'fill-[#f2b04a]'} />
          </g>
          <circle cx="420" cy="56" r="20" className={cx('fill-[#ebe5d1]', show(sky === 'night'))} />
          <g className={show(sky === 'cloud' || sky === 'rain')}>
            <Cloud x={250} y={30} s={1.4} delay={3} tone="cloud2" />
            <Cloud x={760} y={22} s={1.1} delay={5} tone="cloud2" />
            <Cloud x={990} y={44} s={1.5} delay={8} tone="cloud2" />
          </g>
          <g className={show(sky !== 'night')}>
            <Cloud x={470} y={56} s={1.3} delay={4} tone="cloud" />
            <Cloud x={870} y={64} s={1} delay={7} tone="cloud" />
          </g>
        </g>
        <g className={show(sky === 'rain')}>
          {DROPS.map((drop, i) => (
            <line
              key={i}
              className="animate-fall stroke-[#8aa2bd] motion-reduce:animate-none"
              strokeWidth="1.6"
              strokeLinecap="round"
              style={{ animationDelay: `${-drop.d}s` }}
              x1={drop.x}
              y1={drop.y}
              x2={drop.x - 1.5}
              y2={drop.y + 6}
            />
          ))}
        </g>
        <path className={cx('fill-[var(--c-far)]', fill)} d="M0 180V118Q300 98 600 114T1200 112T1800 118T2400 106V180Z" />
        <Tree x={180} y={112} s={1} />
        <Tree x={330} y={106} s={1.2} />
        <Tree x={1980} y={108} s={1.1} />
        <Tree x={2200} y={104} s={1.3} />
        <Tree x={2280} y={114} s={0.9} />
        <g transform="translate(600 0)">
          <Tree x={560} y={108} s={1.1} />
          <Tree x={940} y={104} s={1.2} />
          {[0, 1, 2].map((d) => (
            <circle key={d} cx="686" cy="72" r="4" className={cx('fill-[var(--c-cloud2)] animate-puff motion-reduce:animate-none', fill)} style={{ animationDelay: `${-d * 1.5}s` }} />
          ))}
          <g transform="translate(640 78) scale(1.5)">
            <rect className={cx('fill-[var(--c-roof)]', fill)} x="28" y="-2" width="6" height="14" />
            <rect className={cx('fill-[var(--c-wall)]', fill)} x="0" y="16" width="36" height="34" />
            <path className={cx('fill-[var(--c-roof)]', fill)} d="M-5 18 18 0l23 18z" />
            <rect className={cx('fill-[var(--c-door)]', fill)} x="13.5" y="28" width="9" height="22" rx="1" />
            <rect className={cx('fill-[var(--c-win)]', fill)} x="4" y="22" width="6" height="6" rx="1" />
            <rect className={cx('fill-[var(--c-win)]', fill)} x="26" y="22" width="6" height="6" rx="1" />
            <rect className={cx('fill-[#f0b25a] animate-glow motion-reduce:animate-none', lit ? 'opacity-100' : 'opacity-0')} x="4" y="22" width="6" height="6" rx="1" />
            <rect className={cx('fill-[#f0b25a] animate-glow motion-reduce:animate-none', lit ? 'opacity-100' : 'opacity-0')} x="26" y="22" width="6" height="6" rx="1" />
          </g>
          <Tree x={752} y={112} s={1.3} />
          <Tree x={790} y={118} s={1} />
        </g>
        <path className={fill} style={{ fill: 'var(--bg)' }} filter="url(#sky-soften)" d="M-60 240V140Q300 124 600 138T1200 140T1800 136T2460 132V240Z" />
      </svg>
    </button>
  );
}
