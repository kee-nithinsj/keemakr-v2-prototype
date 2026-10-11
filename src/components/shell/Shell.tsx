import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CHATS } from '@/data/fixtures';
import { DEPARTMENTS, type Department } from '@/data/modules';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';
import { row } from '@/lib/ui';
import { Dotm } from '@/components/ui/Dotm';
import { Avatar } from '@/components/ui/Avatar';
import { KeeMark } from '@/components/ui/KeeMark';
import { IconButton } from '@/components/ui/Button';
import {
  IconChat,
  IconCheck,
  IconChevronDown,
  IconDept,
  IconHome,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSidebar,
  IconSun,
  IconTable,
} from '@/components/ui/icons';
import { useShell } from './shell-context';

const NAV = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/chat/new', label: 'New chat', icon: IconPlus, kbd: '⌘N' },
  { to: '/conversations', label: 'Conversations', icon: IconChat },
  { to: '/tables', label: 'Tables', icon: IconTable },
] as const;

type PalItem = { group: string; label: string; hint: string; to: string };

export function Shell() {
  const navigate = useNavigate();
  const { theme, toggleTheme, sideOpen, setSideOpen, homeCount, inboxCount } = useShell();
  const [palOpen, setPalOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalOpen((v) => !v);
      } else if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        navigate('/chat/new');
      } else if (mod && (e.key === 'b' || e.key === '\\')) {
        e.preventDefault();
        setSideOpen(!sideOpen);
      } else if (e.key === 'Escape') setPalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate, setSideOpen, sideOpen]);

  return (
    <div
      data-side={sideOpen ? 'open' : 'closed'}
      className="group grid h-dvh overflow-hidden bg-frame transition-[grid-template-columns] duration-[220ms] ease-kee max-[760px]:grid-cols-[0px_minmax(0,1fr)]!"
      style={{ gridTemplateColumns: sideOpen ? '280px minmax(0,1fr)' : '0px minmax(0,1fr)' }}
    >
      <aside
        className={cx(
          'flex h-full w-[280px] min-h-0 flex-col px-3 transition-[opacity,transform,visibility] duration-200 ease-kee max-[760px]:hidden',
          !sideOpen && 'pointer-events-none invisible -translate-x-3 opacity-0',
        )}
      >
        <div className="flex h-12 items-center gap-[7px] px-[7px] pb-1 text-[15px] font-medium">
          <KeeMark />
          Kee
          <IconButton className="ml-auto" aria-label="Collapse sidebar" title="Collapse sidebar  ⌘B" onClick={() => setSideOpen(false)}>
            <IconSidebar size={15} />
          </IconButton>
        </div>
        <div className="pb-2.5">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setPalOpen(true)}
            className="flex h-8 w-full items-center gap-2 rounded-lg border border-edge bg-surface px-2.5 text-[13px] text-ink-3 hover:bg-hover hover:text-ink-2 active:scale-[0.99]"
          >
            <IconSearch />
            <span className="flex-1 text-left">Search</span>
            <kbd className="text-[11px] text-ink-4">⌘K</kbd>
          </button>
        </div>
        <nav className="flex flex-col pb-0.5">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : undefined} className={row}>
              <item.icon size={16} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {'kbd' in item ? <kbd className="text-meta text-ink-4">{item.kbd}</kbd> : null}
              {item.to === '/' && homeCount > 0 ? <span className="text-ui text-ink-3 tabular-nums">{homeCount}</span> : null}
              {item.to === '/conversations' ? <span className="text-ui text-ink-3 tabular-nums">{inboxCount}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="mt-2.5 flex min-h-0 flex-1 flex-col overflow-auto [scrollbar-width:none]">
          <div className="flex h-[30px] items-center px-[7px] text-ui text-ink-3">Departments</div>
          {DEPARTMENTS.map((d) => (
            <DepartmentRow key={d.slug} dept={d} />
          ))}
          <div className="mt-2.5 flex h-[30px] items-center px-[7px] text-ui text-ink-3">Chats</div>
          {CHATS.slice(0, 5).map((chat) => (
            <NavLink key={chat.id} to={`/chat/${chat.id}`} className={row}>
              <span className="grid size-4 place-items-center">
                {chat.status === 'live' ? <Dotm className="origin-center scale-[0.85]" /> : <IconChat size={14} className="text-ink-4" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{chat.title}</span>
              <span className="text-ui text-ink-3">{chat.at}</span>
            </NavLink>
          ))}
        </div>
        <div className="grid gap-2.5 py-2 pb-3">
          <div className={cx(row, 'h-[30px] px-1')}>
            <Avatar photo="/clara.jpg" initials="CV" className="size-[22px]" />
            <span className="min-w-0 flex-1 truncate">Clara Vance</span>
            <IconButton aria-label="Switch theme" title="Switch theme" onClick={toggleTheme}>
              {theme === 'light' ? <IconMoon /> : <IconSun />}
            </IconButton>
          </div>
        </div>
      </aside>
      <Outlet />
      <Palette open={palOpen} onClose={() => setPalOpen(false)} inboxCount={inboxCount} />
      <Toast />
    </div>
  );
}

/** Open by default so people find what each department can show them. */
function DepartmentRow({ dept }: { dept: Department }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={cx(row, 'group/dept')}>
        <IconDept size={16} />
        <span className="min-w-0 flex-1 truncate">{dept.name}</span>
        <IconChevronDown size={12} className={cx('text-ink-4 transition-transform duration-200 ease-kee', !open && '-rotate-90')} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={ease(220)}
        className="overflow-hidden"
      >
        <div className="relative ml-[15px] border-l border-line pl-[9px]">
          {dept.screens.map((s) => (
            <NavLink key={s.id} to={`/m/${dept.slug}/${s.id}`} className={row}>
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
            </NavLink>
          ))}
          {dept.tables.map((t) => (
            <NavLink key={t.id} to={`/tables/${t.id}`} className={cx(row, 'text-ink-3')}>
              <IconTable size={13} className="text-ink-4" />
              <span className="min-w-0 flex-1 truncate">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Palette({ open, onClose, inboxCount }: { open: boolean; onClose: () => void; inboxCount: number }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const items = useMemo<PalItem[]>(
    () => [
      { group: 'Go', label: 'Home', hint: '', to: '/' },
      { group: 'Go', label: 'Conversations', hint: `${inboxCount} need you`, to: '/conversations' },
      ...DEPARTMENTS.flatMap((d) => [
        ...d.screens.map((s) => ({ group: d.name, label: `${d.name} ${s.label.toLowerCase()}`, hint: '', to: `/m/${d.slug}/${s.id}` })),
        ...d.tables.map((t) => ({ group: d.name, label: t.label, hint: 'Table', to: `/tables/${t.id}` })),
      ]),
      ...CHATS.map((c) => ({ group: 'Chats', label: c.title, hint: c.at, to: `/chat/${c.id}` })),
      { group: 'Actions', label: 'New chat', hint: '⌘N', to: '/chat/new' },
    ],
    [inboxCount],
  );
  const shown = q.trim()
    ? items.filter((a) => `${a.label} ${a.hint} ${a.group}`.toLowerCase().includes(q.trim().toLowerCase()))
    : items;
  const safeSel = Math.min(sel, Math.max(0, shown.length - 1));

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
    }
  }, [open]);

  const run = (item: PalItem | undefined) => {
    if (!item) return;
    onClose();
    navigate(item.to);
  };

  let group = '';
  return (
    <>
      <div
        className={cx('fixed inset-0 z-40 bg-black/35 transition-opacity duration-150', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Search"
        className={cx(
          'fixed top-[12vh] left-1/2 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[10px] bg-pal shadow-pop transition-opacity duration-150',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <input
          autoFocus={open}
          value={q}
          placeholder="Search chats, people, and actions"
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSel((n) => Math.min(n + 1, shown.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSel((n) => Math.max(n - 1, 0));
            } else if (e.key === 'Enter') run(shown[safeSel]);
            else if (e.key === 'Escape') onClose();
          }}
          className="w-full border-b border-line bg-transparent px-3.5 py-[13px] text-body text-ink outline-none placeholder:text-ink-3"
        />
        <div className="max-h-[340px] overflow-auto p-1.5 [scrollbar-width:none]">
          {shown.length === 0 ? <div className="px-2 pt-2 pb-1 text-meta text-ink-3">Nothing matches</div> : null}
          {shown.map((item, i) => {
            const head = item.group !== group;
            group = item.group;
            return (
              <div key={item.to + item.label}>
                {head ? <div className="px-2 pt-2 pb-1 text-meta text-ink-3">{item.group}</div> : null}
                <button
                  type="button"
                  aria-selected={i === safeSel}
                  onMouseMove={() => setSel(i)}
                  onClick={() => run(item)}
                  className="flex h-[30px] w-full items-center gap-2.5 rounded-md px-2 text-left text-body text-ink-2 aria-selected:bg-sel aria-selected:text-ink"
                >
                  {item.label}
                  <span className="ml-auto text-meta text-ink-3">{item.hint}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Toast() {
  const { toast, hideToast } = useShell();
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(hideToast, 3200);
    return () => window.clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          role="status"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.15, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 40 || info.velocity.y > 500) hideToast();
          }}
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={ease(280)}
          className="fixed right-4 bottom-4 z-50 flex cursor-grab items-center gap-2.5 rounded-lg bg-pal py-2 pr-2 pl-3 text-btn shadow-pop active:cursor-grabbing"
        >
          <IconCheck className="text-ok" />
          <span>{toast.text}</span>
          {toast.undo ? (
            <button
              type="button"
              className="h-6 rounded-md px-2.5 text-ui text-ink-3 hover:bg-hover hover:text-ink"
              onClick={() => {
                toast.undo?.();
                hideToast();
              }}
            >
              Undo
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AppBar() {
  const { setSideOpen } = useShell();
  return (
    <header className="hidden h-11 items-center gap-2.5 border-b border-line px-3.5 group-data-[side=closed]:flex">
      <IconButton aria-label="Open sidebar" title="Open sidebar  ⌘B" onClick={() => setSideOpen(true)}>
        <IconSidebar size={15} />
      </IconButton>
    </header>
  );
}
