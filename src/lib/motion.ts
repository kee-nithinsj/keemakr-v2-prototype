import type { Transition } from 'motion/react';

/** Same curves as the CSS tokens `--ease` and `--ease-io`. */
export const EASE = [0.23, 1, 0.32, 1] as const;
export const EASE_IO = [0.77, 0, 0.175, 1] as const;

export const ease = (duration: number, delay = 0): Transition => ({ duration: duration / 1000, ease: EASE, delay: delay / 1000 });

/** Default UI spring: settles fast, no visible wobble. */
export const SNAP: Transition = { type: 'spring', visualDuration: 0.24, bounce: 0 };

/** Rows that leave collapse their height first, then the gap closes. */
export const collapse = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { height: ease(240), opacity: ease(160) },
} as const;

export const rise = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: ease(280),
} as const;

export const rowIn = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  transition: ease(260),
} as const;
