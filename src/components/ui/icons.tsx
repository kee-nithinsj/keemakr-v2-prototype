import type { ReactNode, SVGProps } from 'react';

type IconProps = { size?: number } & Omit<SVGProps<SVGSVGElement>, 'children'>;

function make(children: ReactNode, defaults: SVGProps<SVGSVGElement> = {}) {
  return function Icon({ size = 14, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        aria-hidden="true"
        {...defaults}
        {...rest}
      >
        {children}
      </svg>
    );
  };
}

const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconHome = make(<path d="M2.5 7 8 2.5 13.5 7v6a.5.5 0 0 1-.5.5H9.5V10h-3v3.5H3a.5.5 0 0 1-.5-.5Z" />, { strokeLinejoin: 'round' });
export const IconPlus = make(<path d="M8 3v10M3 8h10" />, { strokeLinecap: 'round' });
export const IconChat = make(<path d="M2.5 4.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7l-3 2.5v-2.5a2 2 0 0 1-1.5-2Z" />, { strokeLinejoin: 'round' });
export const IconDept = make(<><rect x="2.5" y="3.5" width="11" height="9" rx="1.5" /><path d="M2.5 6.5h11" /></>, { strokeWidth: 1.3 });
export const IconSearch = make(<><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></>, { strokeLinecap: 'round' });
export const IconSidebar = make(<><rect x="2" y="2.5" width="12" height="11" rx="2" /><path d="M6 2.5v11" /></>, { strokeWidth: 1.3 });
export const IconSun = make(<><circle cx="8" cy="8" r="2.8" /><path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" /></>, { strokeLinecap: 'round' });
export const IconMoon = make(<path d="M13.2 9.6A5.5 5.5 0 0 1 6.4 2.8a5.5 5.5 0 1 0 6.8 6.8Z" />, { strokeLinejoin: 'round' });

export const IconTable = make(<><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M2 6.5h12M2 10h12M6.5 6.5V13" /></>);
export const IconReport = make(<><path d="M4 2h5.5L12.5 5v9h-8.5Z" strokeLinejoin="round" /><path d="M9.5 2v3h3M6.5 11V9M8.5 11V7.5M10.5 11V8.5" strokeLinecap="round" strokeLinejoin="round" /></>);
export const IconRetry = make(<path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" />, round);
export const IconMeet = make(<><rect x="1.5" y="4" width="9" height="8" rx="1.5" /><path d="m10.5 7 4-2v6l-4-2" /></>, { strokeLinejoin: 'round' });
export const IconMail = make(<><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="m2.5 4.5 5.5 4 5.5-4" /></>, { strokeLinejoin: 'round' });
export const IconCal = make(<><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" /><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" /></>);
export const IconLink = make(<path d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.8 2.8 0 0 1 4 4l-1 1M9 11.5l-1 1a2.8 2.8 0 0 1-4-4l1-1" />, { strokeLinecap: 'round' });
export const IconHand = make(<><path d="M2.5 13c.6-2.3 2.6-3.5 5.5-3.5s4.9 1.2 5.5 3.5" /><circle cx="8" cy="5.5" r="2.5" /></>, round);
export const IconShield = make(<path d="M8 2 3 4v4c0 3 2.2 5 5 6 2.8-1 5-3 5-6V4L8 2Z" />, { strokeLinejoin: 'round' });
export const IconGlobe = make(<><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" /></>, { strokeWidth: 1.8 });
export const IconPeople = make(<><circle cx="6" cy="5.5" r="2.3" /><path d="M1.8 13c.5-2.2 2.1-3.4 4.2-3.4s3.7 1.2 4.2 3.4M10.5 3.4a2.2 2.2 0 0 1 0 4.3M12 9.8c1.2.4 2 1.5 2.3 3.2" /></>, round);

export const IconX = make(<path d="m4 4 8 8M12 4l-8 8" />, { strokeWidth: 2, strokeLinecap: 'round' });
export const IconCheck = make(<path d="m3.5 8.5 3 3 6-7" />, { strokeWidth: 2, ...round });
export const IconArrowRight = make(<path d="M3 8h10M9 4l4 4-4 4" />, { strokeWidth: 1.6, ...round });
export const IconArrowUp = make(<path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />, { strokeWidth: 2, ...round });
export const IconChevronDown = make(<path d="m4 6 4 4 4-4" />, { strokeWidth: 1.6, ...round });
export const IconChevronLeft = make(<path d="m10 3-5 5 5 5" />, { strokeWidth: 2, ...round });
export const IconChevronRight = make(<path d="m6 3 5 5-5 5" />, { strokeWidth: 2, ...round });
