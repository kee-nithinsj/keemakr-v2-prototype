import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppBar } from '@/components/shell/Shell';
import { useShell } from '@/components/shell/shell-context';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Dotm } from '@/components/ui/Dotm';
import { IconChevronDown, IconSearch } from '@/components/ui/icons';
import type { Connection, ConnectionStatus } from '@/data/connections';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';
import { sleep } from '@/lib/time';
import { canvas, canvasLight } from '@/lib/ui';

const ORDER: Record<ConnectionStatus, number> = { attention: 0, connected: 1, available: 2 };
const byStatus = (list: Connection[]) => [...list].sort((a, b) => ORDER[a.status] - ORDER[b.status]);

export function Connections() {
  const { theme, connections, setConnections, showToast } = useShell();
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Connection>) =>
    setConnections((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const connect = async (c: Connection) => {
    setBusy(c.id);
    await sleep(1100); // stands in for the provider's consent screen
    update(c.id, { status: 'connected', problem: undefined, account: c.account ?? (c.scope === 'you' ? 'clara@larkline.co' : 'Larkline'), since: 'today' });
    setBusy(null);
    showToast(`${c.name} connected`);
  };
  const disconnect = (c: Connection) => {
    update(c.id, { status: 'available' });
    setOpen(null);
    showToast(`${c.name} disconnected`, () => update(c.id, c));
  };

  const yours = byStatus(connections.filter((c) => c.scope === 'you'));
  const workspace = connections.filter((c) => c.scope === 'workspace');
  const filters = ['All', 'Connected', ...new Set(workspace.map((c) => c.category))];
  const shown = byStatus(
    workspace.filter(
      (c) =>
        (filter === 'All' || (filter === 'Connected' ? c.status !== 'available' : c.category === filter)) &&
        `${c.name} ${c.about} ${c.category}`.toLowerCase().includes(q.trim().toLowerCase()),
    ),
  );

  const row = (c: Connection) => (
    <Row
      key={c.id}
      c={c}
      open={open === c.id}
      busy={busy === c.id}
      onToggle={() => setOpen((cur) => (cur === c.id ? null : c.id))}
      onConnect={() => void connect(c)}
      onTest={() => showToast(`${c.name} is working`)}
      onDisconnect={() => disconnect(c)}
    />
  );

  return (
    <main className={cx(canvas, 'grid grid-rows-[auto_minmax(0,1fr)] text-body')} style={theme === 'light' ? canvasLight : undefined}>
      <AppBar />
      <div className="row-start-2 min-h-0 overflow-auto [scrollbar-width:none]">
        <div className="mx-auto w-full max-w-[880px] animate-rise px-12 pt-14 pb-20 max-[760px]:px-5">
          <h1 className="m-0 text-greeting font-medium tracking-[-0.015em] text-ink">Connections</h1>
          <p className="mt-1.5 mb-10 text-lead text-ink-3">The accounts and apps Kee works with.</p>

          <section className="mb-12">
            <h2 className="m-0 text-ui font-medium text-ink-3">Your accounts</h2>
            <p className="mt-0.5 mb-3 text-meta text-ink-3">Only you can use these. Kee sends and reads as you.</p>
            <div className="grid">{yours.map(row)}</div>
          </section>

          <section>
            <h2 className="m-0 text-ui font-medium text-ink-3">Workspace</h2>
            <p className="mt-0.5 mb-4 text-meta text-ink-3">Shared with everyone at Larkline. Owners and admins connect these.</p>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={f === filter}
                    onClick={() => setFilter(f)}
                    className="h-7 rounded-md px-2.5 text-ui text-ink-3 hover:bg-hover hover:text-ink aria-pressed:bg-sel aria-pressed:text-ink"
                  >
                    {f}
                  </button>
                ))}
              </div>
              <label className="ml-auto flex h-7 w-[200px] items-center gap-2 rounded-md border border-line-2 px-2.5 text-ink-3 focus-within:border-ink-4">
                <IconSearch size={13} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an app" className="min-w-0 flex-1 bg-transparent text-ui text-ink outline-none placeholder:text-ink-3" />
              </label>
            </div>
            <div className="grid">{shown.map(row)}</div>
            {shown.length === 0 ? <div className="py-6 text-ink-3">No app matches.</div> : null}
            <p className="mt-6 mb-0 text-ui text-ink-3">
              Don't see your app?{' '}
              <button type="button" onClick={() => showToast('Request sent to the Kee team')} className="text-ink-2 underline decoration-line-2 underline-offset-[3px] hover:text-ink">
                Request an app
              </button>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

type RowProps = {
  c: Connection;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onConnect: () => void;
  onTest: () => void;
  onDisconnect: () => void;
};

function Row({ c, open, busy, onToggle, onConnect, onTest, onDisconnect }: RowProps) {
  const connected = c.status === 'connected';
  return (
    <div className={cx('-mx-3 rounded-lg transition-colors duration-150', open && 'bg-surface')}>
      <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3">
        <span className="grid size-9 place-items-center rounded-[9px] border border-edge bg-bg text-btn font-medium text-ink-2">
          {c.brand ? <BrandLogo name={c.brand} size={17} /> : c.name[0]}
        </span>
        <span className="grid min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-body text-ink">{c.name}</span>
            {c.usedBy?.map((d) => (
              <span key={d} className="shrink-0 rounded bg-chip px-1.5 text-meta text-ink-3">
                {d}
              </span>
            ))}
          </span>
          <span className={cx('truncate text-meta', c.status === 'attention' ? 'text-accent-ink' : 'text-ink-3')}>
            {c.status === 'attention' ? c.problem : connected ? c.account : c.about}
          </span>
        </span>
        {busy ? (
          <span className="inline-flex items-center gap-2 text-ui text-ink-3">
            <Dotm className="origin-center scale-[0.8]" />
            Connecting
          </span>
        ) : c.status === 'attention' ? (
          <Button size="sm" tone="pri" onClick={onConnect}>
            Reconnect
          </Button>
        ) : connected ? (
          <button type="button" aria-expanded={open} onClick={onToggle} className="inline-flex h-[26px] items-center gap-2 rounded-[7px] px-2.5 text-ui text-ink-2 hover:bg-hover hover:text-ink">
            <i className="size-1.5 rounded-full bg-ok" />
            Connected
            <IconChevronDown size={11} className={cx('text-ink-4 transition-transform duration-200 ease-kee', open && 'rotate-180')} />
          </button>
        ) : (
          <Button size="sm" onClick={onConnect}>
            Connect
          </Button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && connected ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={ease(220)} className="overflow-hidden">
            <div className="grid gap-4 pr-3 pb-4 pl-[60px]">
              <dl className="m-0 grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-ui">
                <dt className="text-ink-3">Account</dt>
                <dd className="m-0 text-ink-2">{c.account}</dd>
                <dt className="text-ink-3">Connected</dt>
                <dd className="m-0 text-ink-2">{c.since}</dd>
                {c.can ? (
                  <>
                    <dt className="text-ink-3">Kee can</dt>
                    <dd className="m-0 text-ink-2">{c.can}</dd>
                  </>
                ) : null}
              </dl>
              <div className="flex gap-2">
                <Button size="sm" onClick={onTest}>
                  Test connection
                </Button>
                <Button size="sm" tone="plain" onClick={onDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
