import { cx } from '@/lib/cx';

const OUTER: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 4], [2, 4], [3, 4], [4, 4], [4, 3],
  [4, 2], [4, 1], [4, 0], [3, 0], [2, 0], [1, 0],
];
const MIDDLE: ReadonlyArray<readonly [number, number]> = [
  [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2],
];

export function Dotm({ className }: { className?: string }) {
  const cells = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const o = OUTER.findIndex(([y, x]) => y === r && x === c);
      const m = MIDDLE.findIndex(([y, x]) => y === r && x === c);
      const on = o >= 0 || m >= 0;
      const delay = o >= 0 ? o * 0.0625 * 1.11 : m >= 0 ? m * 0.125 * 1.11 : 0;
      cells.push(
        <i
          key={`${r}-${c}`}
          className={cx('size-0.5 rounded-full bg-current', on ? 'animate-dotm opacity-100 motion-reduce:animate-none' : 'invisible')}
          style={on ? { animationDelay: `${-delay}s` } : undefined}
        />,
      );
    }
  }
  return (
    <span className={cx('grid grid-cols-5 gap-px text-accent', className)} aria-hidden>
      {cells}
    </span>
  );
}
