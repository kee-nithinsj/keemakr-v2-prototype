import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AppBar } from '@/components/shell/Shell';
import { useShell } from '@/components/shell/shell-context';
import { Button, IconButton } from '@/components/ui/Button';
import { KeeMark } from '@/components/ui/KeeMark';
import { IconArrowUp, IconChevronLeft, IconPlus, IconSearch, IconSidebar, IconTable, IconX } from '@/components/ui/icons';
import { Dotm } from '@/components/ui/Dotm';
import { TABLES, tableById, type ColType, type Row, type Table } from '@/data/tables';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';
import { sleep } from '@/lib/time';
import { canvas, canvasLight } from '@/lib/ui';

const GLYPH: Record<ColType, string> = { text: 'T', email: '@', enum: '≡', number: '#', date: '▤', url: '↗' };

const STATUS_DOT: Record<string, string> = {
  Booked: 'bg-ok',
  Done: 'bg-ok',
  'In conversation': 'bg-ask',
  Running: 'bg-ask',
  'Needs you': 'bg-accent',
  Waiting: 'bg-accent',
};

export function Tables() {
  const { id } = useParams();
  const { theme } = useShell();
  const table = id ? tableById(id) : undefined;
  return (
    <main className={cx(canvas, 'grid grid-rows-[auto_minmax(0,1fr)] text-body')} style={theme === 'light' ? canvasLight : undefined}>
      <AppBar />
      {table ? <TableView key={table.id} table={table} /> : <TablesIndex />}
    </main>
  );
}

function TablesIndex() {
  const [q, setQ] = useState('');
  const shown = TABLES.filter((t) => `${t.name} ${t.about} ${t.group}`.toLowerCase().includes(q.trim().toLowerCase()));
  const groups = [...new Set(shown.map((t) => t.group))];
  return (
    <div className="min-h-0 overflow-auto [scrollbar-width:none]">
      <div className="mx-auto w-full max-w-[880px] animate-rise px-12 pt-14 pb-20 max-[760px]:px-5">
        <h1 className="m-0 text-greeting font-medium tracking-[-0.015em] text-ink">Tables</h1>
        <p className="mt-1.5 mb-6 text-lead text-ink-3">Everything Kee keeps for you, in rows you can read and change.</p>
        <label className="mb-8 flex h-9 items-center gap-2 rounded-lg border border-line-2 px-3 text-ink-3 focus-within:border-ink-4">
          <IconSearch size={14} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a table by what it holds" className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-3" />
        </label>
        <div className="grid gap-8">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="m-0 mb-2 text-ui font-medium text-ink-3">{g}</h2>
              <div className="grid">
                {shown
                  .filter((t) => t.group === g)
                  .map((t) => (
                    <Link key={t.id} to={`/tables/${t.id}`} className="-mx-3 grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-hover">
                      <IconTable size={15} className="text-ink-3" />
                      <span className="grid min-w-0">
                        <span className="truncate text-body text-ink">{t.name}</span>
                        <span className="truncate text-meta text-ink-3">{t.about}</span>
                      </span>
                      <span className="text-meta text-ink-3 tabular-nums">
                        {t.count} rows · {t.updated}
                      </span>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
          {shown.length === 0 ? <div className="text-ink-3">No table holds that.</div> : null}
        </div>
      </div>
    </div>
  );
}

function TableView({ table }: { table: Table }) {
  const [view, setView] = useState<'grid' | 'pipeline'>('grid');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [kee, setKee] = useState(true);
  const rows = table.rows.filter((r) =>
    table.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q.trim().toLowerCase())),
  );
  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="row-start-2 grid h-full min-h-0 transition-[grid-template-columns] duration-[220ms] ease-kee" style={{ gridTemplateColumns: kee ? 'minmax(0,1fr) 360px' : 'minmax(0,1fr) 0px' }}>
      <div className="flex min-h-0 min-w-0 flex-col">
        <header className="px-8 pt-8 pb-4">
          <Link to="/tables" className="mb-3 inline-flex items-center gap-1 text-ui text-ink-3 hover:text-ink">
            <IconChevronLeft size={11} />
            Tables
          </Link>
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="m-0 text-[24px] leading-[30px] font-medium tracking-[-0.01em] text-ink">{table.name}</h1>
              <p className="mt-1 mb-0 text-ui text-ink-3">
                {table.count} rows · {table.group} · updated {table.updated}
              </p>
            </div>
            {!kee ? (
              <Button size="sm" onClick={() => setKee(true)}>
                <KeeMark />
                Ask Kee
              </Button>
            ) : null}
          </div>
        </header>
        <div className="flex items-center gap-2 px-8 pb-3">
          <div className="flex gap-1">
            {(['grid', ...(table.stages ? ['pipeline'] : [])] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v as 'grid' | 'pipeline')}
                className="h-7 rounded-md px-2.5 text-ui text-ink-3 capitalize hover:bg-hover hover:text-ink aria-pressed:bg-sel aria-pressed:text-ink"
              >
                {v}
              </button>
            ))}
          </div>
          <label className="ml-auto flex h-7 w-[220px] items-center gap-2 rounded-md border border-line-2 px-2.5 text-ink-3 focus-within:border-ink-4">
            <IconSearch size={13} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rows" className="min-w-0 flex-1 bg-transparent text-ui text-ink outline-none placeholder:text-ink-3" />
          </label>
          <Button size="sm">
            <IconPlus size={11} />
            Add row
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-8 pb-8 [scrollbar-width:none]">
          {view === 'grid' ? <Grid table={table} rows={rows} picked={picked} toggle={toggle} /> : <Board table={table} rows={rows} />}
        </div>
      </div>
      <aside className={cx('flex min-h-0 min-w-0 flex-col border-l border-line transition-opacity duration-200', !kee && 'pointer-events-none opacity-0')}>
        <SideKee table={table} picked={picked.size} onClose={() => setKee(false)} onClear={() => setPicked(new Set())} />
      </aside>
    </div>
  );
}

function CellText({ value, col }: { value: string; col: { key: string; type: ColType } }) {
  if (col.type === 'enum' && STATUS_DOT[value])
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-ink-2">
        <i className={cx('size-1.5 shrink-0 rounded-full', STATUS_DOT[value])} />
        {value}
      </span>
    );
  if (col.type === 'enum') return <span className="rounded whitespace-nowrap bg-chip px-1.5 py-px text-ui text-ink-2">{value}</span>;
  return <span className={cx('truncate', col.key === 'name' ? 'text-ink' : 'text-ink-2', col.type === 'number' && 'tabular-nums')}>{value}</span>;
}

function Grid({ table, rows, picked, toggle }: { table: Table; rows: Row[]; picked: Set<string>; toggle: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="w-10" />
            {table.columns.map((c) => (
              <th key={c.key} className="h-9 px-3 text-meta font-normal whitespace-nowrap text-ink-3">
                <span className="mr-1.5 inline-block w-3 text-center text-ink-4">{GLYPH[c.type]}</span>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const on = picked.has(r.id);
            return (
              <tr key={r.id} onClick={() => toggle(r.id)} className={cx('cursor-pointer border-b border-line last:border-b-0', on ? 'bg-sel' : 'hover:bg-hover')}>
                <td className="w-10 pl-3.5">
                  <span className={cx('grid size-3.5 place-items-center rounded-[4px] border', on ? 'border-accent bg-accent' : 'border-line-2')}>
                    {on ? <i className="size-1.5 rounded-[1px] bg-on-accent" /> : null}
                  </span>
                </td>
                {table.columns.map((c, i) => (
                  <td key={c.key} className="h-11 max-w-[240px] px-3 text-body">
                    <span className="flex items-center gap-2">
                      <CellText value={String(r[c.key] ?? '')} col={c} />
                      {i === 0 && r.kee ? (
                        <span title="Kee is updating this row" className="inline-flex items-center gap-1 text-meta text-ink-3">
                          <Dotm className="origin-center scale-[0.7]" />
                        </span>
                      ) : null}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={table.columns.length + 1} className="h-24 text-center text-ink-3">
                No rows match
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function Board({ table, rows }: { table: Table; rows: Row[] }) {
  const stages = table.stages!;
  return (
    <div className="grid grid-cols-[repeat(4,minmax(200px,1fr))] gap-3">
      {stages.order.map((s) => {
        const items = rows.filter((r) => r[stages.key] === s);
        return (
          <section key={s} className="rounded-xl bg-surface p-2">
            <h3 className="m-0 flex items-center gap-2 px-1.5 pt-1 pb-2.5 text-ui font-medium text-ink-2">
              {s}
              <span className="font-normal text-ink-3 tabular-nums">{items.length}</span>
            </h3>
            <div className="grid gap-1.5">
              {items.map((r) => (
                <div key={r.id} className="rounded-lg border border-edge bg-bg px-3 py-2.5">
                  <div className="truncate text-body text-ink">{r.name}</div>
                  <div className="truncate text-meta text-ink-3">{r.company}</div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

type Line = { id: number; who: 'me' | 'kee'; text: string };

const SUGGEST: Record<string, string[]> = {
  leads: ['Who replied but has no call booked?', 'Draft follow-ups for tier A leads', 'Which companies have 2+ leads?'],
  companies: ['Which companies have no lead yet?', 'Find the owner for Riverside Smiles'],
  runs: ['Why is Austin waiting?', 'Compare reply rates across runs'],
};

function SideKee({ table, picked, onClose, onClear }: { table: Table; picked: number; onClose: () => void; onClear: () => void }) {
  const navigate = useNavigate();
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lines, busy]);

  const scope = picked ? `${picked} row${picked > 1 ? 's' : ''} selected` : `All ${table.count} rows`;
  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setDraft('');
    setLines((l) => [...l, { id: l.length, who: 'me', text }]);
    setBusy(true);
    await sleep(900);
    setLines((l) => [
      ...l,
      {
        id: l.length,
        who: 'kee',
        text: picked
          ? `Looked at the ${picked} rows you picked. Two have replied without a call booked: Priya Shah and Kim Nguyen. Want me to draft a short nudge for both?`
          : `Priya Shah and Kim Nguyen replied but have no call booked. Both are in conversation; Priya asked about pricing for two locations.`,
      },
    ]);
    setBusy(false);
  };

  return (
    <>
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <KeeMark />
        <span className="text-btn font-medium text-ink">Ask Kee</span>
        <IconButton className="ml-auto" aria-label="Continue in a full chat" title="Continue in a full chat" onClick={() => navigate('/chat/new')}>
          <IconSidebar size={14} />
        </IconButton>
        <IconButton aria-label="Close" onClick={onClose}>
          <IconX size={11} />
        </IconButton>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 [scrollbar-width:none]">
        {lines.length === 0 ? (
          <div className="pt-4">
            <p className="m-0 mb-4 text-body text-ink-2">Ask about these rows, or tell Kee what to change.</p>
            <div className="grid gap-1.5">
              {(SUGGEST[table.id] ?? ['Summarize this table']).map((s) => (
                <button key={s} type="button" onClick={() => void send(s)} className="rounded-lg border border-edge px-3 py-2 text-left text-ui text-ink-2 hover:border-line-2 hover:bg-surface hover:text-ink">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.div key={l.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease(240)} className={cx('text-chat', l.who === 'me' ? 'ml-8 rounded-xl bg-surface px-3 py-2 text-ink' : 'text-ink-2')}>
                  {l.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {busy ? (
              <div className="inline-flex items-center gap-2 text-ui text-ink-3">
                <Dotm className="origin-center scale-[0.8]" />
                Reading {table.name.toLowerCase()}
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        )}
      </div>
      <div className="shrink-0 p-3">
        <div className="mb-2 flex h-6 items-center gap-1.5 px-1 text-meta text-ink-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-chip px-2 py-0.5 text-ink-2">
            <IconTable size={11} />
            {table.name} · {scope}
          </span>
          {picked ? (
            <button type="button" onClick={onClear} className="rounded px-1 hover:text-ink">
              Clear
            </button>
          ) : null}
        </div>
        <div className="flex min-h-10 items-end gap-1.5 rounded-2xl border border-edge bg-surface py-[8px] pr-[7px] pl-3 focus-within:border-accent-line">
          <textarea
            rows={1}
            value={draft}
            placeholder={`Ask about ${table.name.toLowerCase()}`}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send(draft);
              }
            }}
            className="block max-h-[140px] min-h-[22.4px] w-full flex-1 resize-none bg-transparent leading-[22.4px] text-ink caret-accent outline-none placeholder:text-ink-3"
          />
          <button type="button" aria-label="Send" onClick={() => void send(draft)} className={cx('grid size-[22px] shrink-0 place-items-center rounded-full bg-send-off text-bg', draft.trim() && 'bg-accent text-on-accent active:scale-95')}>
            <IconArrowUp size={12} />
          </button>
        </div>
      </div>
    </>
  );
}
