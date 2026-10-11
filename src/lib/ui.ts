import type { CSSProperties } from 'react';

/** The rounded page surface. Sidebar open/closed is a `data-side` on the shell `group`. */
export const canvas =
  'relative m-2.5 ml-0 min-h-0 overflow-hidden rounded-xl border border-edge bg-bg shadow-lift transition-[margin] duration-[220ms] ease-kee group-data-[side=closed]:ml-2.5 max-[760px]:ml-2.5';

/** Light theme tightens a few tones inside the page, and leaves the sidebar alone. */
export const canvasLight = {
  '--sel': '#e4e4e4',
  '--hover': '#e9e9e9',
  '--surface-2': '#e8e8e8',
  '--chip': '#ebebeb',
} as CSSProperties;

export const row =
  'flex h-[30px] w-full shrink-0 items-center gap-2 rounded-md px-[7px] text-left text-body whitespace-nowrap text-ink-2 hover:bg-hover hover:text-ink aria-[current=page]:bg-sel aria-[current=page]:text-ink';
