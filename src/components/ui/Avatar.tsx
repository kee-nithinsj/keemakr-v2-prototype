import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/cx';

const X = ['3.85%', '50%', '96.15%'] as const;
const Y = ['0.15%', '46.3%', '92.5%'] as const;
const FACES = {
  maya: [0, 0],
  priya: [1, 0],
  ana: [2, 0],
  jordan: [0, 1],
  chris: [1, 1],
  dana: [2, 1],
  jess: [0, 2],
  sam: [1, 2],
  rita: [2, 2],
} as const satisfies Record<string, readonly [0 | 1 | 2, 0 | 1 | 2]>;

export type FaceId = keyof typeof FACES;

const SIZE = {
  xs: 'size-4 text-[8px]',
  sm: 'size-[18px] text-[9px]',
  md: 'size-7 text-[11px]',
  lg: 'size-9 text-[13px]',
} as const;

type Props = {
  initials: string;
  face?: FaceId;
  /** A single portrait, for people outside the face sheet. */
  photo?: string;
  size?: keyof typeof SIZE;
  anon?: boolean;
  badge?: ReactNode;
  className?: string;
};

export function Avatar({ initials, face, photo, size = 'md', anon, badge, className }: Props) {
  const pos = face ? FACES[face] : undefined;
  const style: CSSProperties | undefined = photo
    ? { backgroundImage: `url(${photo})`, backgroundPosition: 'center', backgroundSize: 'cover' }
    : pos
      ? { backgroundImage: 'url(/faces.jpg)', backgroundPosition: `${X[pos[0]]} ${Y[pos[1]]}`, backgroundSize: '360% 360%' }
      : undefined;
  return (
    <span
      className={cx(
        'relative grid shrink-0 place-items-center rounded-full bg-surface-2 font-medium text-ink-2',
        SIZE[size],
        (pos || photo) && 'text-transparent',
        anon && 'border border-dashed border-line-2 bg-transparent text-ink-3',
        className,
      )}
      style={style}
    >
      {initials}
      {badge ? <span className="absolute -right-[3px] -bottom-[3px] grid size-[15px] place-items-center rounded-full bg-bg text-ink-3">{badge}</span> : null}
    </span>
  );
}

export function AvatarStack({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('flex [&>*]:-ml-[5px] [&>*]:shadow-[0_0_0_1.5px_var(--bg)] [&>*:first-child]:ml-0', className)}>{children}</span>;
}
