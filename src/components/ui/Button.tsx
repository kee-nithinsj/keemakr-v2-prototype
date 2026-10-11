import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/lib/cx';

const SIZE = {
  md: 'h-[30px] gap-[7px] rounded-lg px-3 text-[13px]',
  sm: 'h-[26px] gap-1.5 rounded-[7px] px-2.5 text-[12.5px]',
  xs: 'h-6 gap-[5px] rounded-md px-[9px] text-meta',
} as const;

const TONE = {
  default: 'border-line-2 text-ink-2 hover:bg-hover hover:text-ink',
  pri: 'border-transparent bg-accent font-medium text-on-accent hover:opacity-90',
  plain: 'border-transparent text-ink-3 hover:bg-hover hover:text-ink',
} as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: keyof typeof SIZE;
  tone?: keyof typeof TONE;
  to?: string;
  children?: ReactNode;
};

export function Button({ size = 'md', tone = 'default', to, className, children, ...props }: Props) {
  const cls = cx(
    'inline-flex items-center justify-center border whitespace-nowrap transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45',
    SIZE[size],
    TONE[tone],
    className,
  );
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cx('grid size-[26px] place-items-center rounded-md text-ink-3 hover:bg-hover hover:text-ink', className)} {...props} />;
}
