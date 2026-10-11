import { cx } from '@/lib/cx';

const SIZE = {
  sm: 'size-[11px] rounded-[3px] [&>i]:h-px [&>i]:w-[5px] [&>i]:-translate-y-px [&>i]:shadow-[0_2px_0_var(--on-accent)]',
  md: 'size-[14px] rounded [&>i]:h-[1.5px] [&>i]:w-[7px] [&>i]:rounded-[1px] [&>i]:-translate-y-[1.5px] [&>i]:shadow-[0_3px_0_var(--on-accent)]',
  lg: 'size-[30px] rounded-[9px] [&>i]:h-[2.5px] [&>i]:w-3.5 [&>i]:rounded-[2px] [&>i]:-translate-y-[2.75px] [&>i]:shadow-[0_5.5px_0_var(--on-accent)]',
} as const;

export function KeeMark({ size = 'md', className }: { size?: keyof typeof SIZE; className?: string }) {
  return (
    <span className={cx('inline-grid shrink-0 place-items-center bg-accent [&>i]:block [&>i]:bg-on-accent', SIZE[size], className)} aria-hidden>
      <i />
    </span>
  );
}
