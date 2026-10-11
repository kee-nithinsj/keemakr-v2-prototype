import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type ThemeName = 'dark' | 'light';

type Toast = { text: string; undo?: () => void; id: number };

type Shell = {
  theme: ThemeName;
  toggleTheme: () => void;
  sideOpen: boolean;
  setSideOpen: (open: boolean) => void;
  homeCount: number;
  setHomeCount: (n: number) => void;
  inboxCount: number;
  setInboxCount: (n: number) => void;
  toast: Toast | null;
  showToast: (text: string, undo?: () => void) => void;
  hideToast: () => void;
};

const Ctx = createContext<Shell | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(
    () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'),
  );
  const [sideOpen, setSide] = useState(() => localStorage.getItem('kee-side') !== 'closed');
  const [homeCount, setHomeCount] = useState(5);
  const [inboxCount, setInboxCount] = useState(4);
  const [toast, setToast] = useState<Toast | null>(null);

  const toggleTheme = useCallback(() => {
    setTheme((cur) => {
      const next: ThemeName = cur === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('kee-theme', next);
      return next;
    });
  }, []);

  const setSideOpen = useCallback((open: boolean) => {
    setSide(open);
    localStorage.setItem('kee-side', open ? 'open' : 'closed');
  }, []);

  const showToast = useCallback((text: string, undo?: () => void) => {
    setToast({ text, undo, id: Date.now() });
  }, []);
  const hideToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ theme, toggleTheme, sideOpen, setSideOpen, homeCount, setHomeCount, inboxCount, setInboxCount, toast, showToast, hideToast }),
    [theme, toggleTheme, sideOpen, setSideOpen, homeCount, inboxCount, toast, showToast, hideToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShell(): Shell {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShell outside ShellProvider');
  return ctx;
}
