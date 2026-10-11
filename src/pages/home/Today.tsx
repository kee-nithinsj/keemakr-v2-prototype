import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconPlus } from '@/components/ui/icons';
import { REMINDERS } from '@/data/fixtures';
import type { Reminder } from '@/data/types';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';
import { pad } from '@/lib/time';
import { useShell } from '@/components/shell/shell-context';

type Ev = {
  id: string;
  start: number;
  title: string;
  sub: string;
  meet?: string;
  kee?: boolean;
  face?: 'jess' | 'maya' | 'chris' | 'ana' | 'jordan' | 'dana';
  initials?: string;
};

function soon(now: Date) {
  const m = Math.ceil((now.getHours() * 60 + now.getMinutes() + 9) / 15) * 15;
  const hh = Math.min(Math.floor(m / 60), 23);
  return hh * 60 + (m % 60);
}

function fmt(mins: number) {
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${(hh % 12) || 12}:${pad(mm)} ${hh < 12 ? 'am' : 'pm'}`;
}

function weekOf(now: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return d;
  });
}

function eventsFor(now: Date): Ev[][] {
  const maya = soon(now);
  const today: Ev[] = [
    { id: 'plan', start: 10 * 60, title: 'Weekly planning', sub: 'Just you' },
    { id: 'pipe', start: 14 * 60, title: 'Pipeline review', sub: 'With Jess Park · Google Meet', meet: 'Google Meet', face: 'jess', initials: 'JP' },
    { id: 'maya', start: maya, title: 'Call · Dr. Maya Ellison', sub: 'Booked by Kee on WhatsApp', meet: 'Google Meet', kee: true, face: 'maya', initials: 'ME' },
  ];
  return [
    today.sort((a, b) => a.start - b.start),
    [{ id: 'chris', start: 11 * 60, title: 'Demo · Chris Patel', sub: 'Booked by Kee on Instagram', kee: true, face: 'chris', initials: 'CP' }],
    [{ id: 'sync', start: 10 * 60, title: 'Team sync', sub: 'Sales · Google Meet' }],
    [],
    [
      { id: 'ana', start: 15 * 60, title: 'Demo · Ana Lima', sub: 'Moved by Kee · she asked', kee: true, face: 'ana', initials: 'AL' },
      { id: 'jordan', start: 16 * 60, title: 'Contract call · Jordan Reyes', sub: 'With Jess Park', face: 'jordan', initials: 'JR' },
    ],
    [{ id: 'dana', start: 11 * 60, title: 'Demo · Dana Wu', sub: 'Booked by Kee by email', kee: true, face: 'dana', initials: 'DW' }],
    [],
  ];
}

export function Today() {
  const { showToast } = useShell();
  const now = useRef(new Date()).current;
  const days = useRef(weekOf(now)).current;
  const events = useRef(eventsFor(now)).current;
  const [day, setDay] = useState(0);
  const [sent, setSent] = useState<Set<string>>(() => new Set());
  const [rems, setRems] = useState<Reminder[]>(() => REMINDERS.map((r) => ({ ...r })));
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [adding, setAdding] = useState(false);
  const weekRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const scroller = useRef<HTMLElement>(null);
  const fade = useMotionValue(0);
  const mask = useTransform(fade, (v) => `linear-gradient(to bottom, transparent 0, #000 ${v}px)`);
  const faded = useRef(false);

  useLayoutEffect(() => {
    const b = weekRef.current?.querySelector<HTMLElement>(`[data-day="${day}"]`);
    if (!b) return;
    setPill({ x: b.offsetLeft, w: b.offsetWidth });
  }, [day]);

  useEffect(() => {
    const onResize = () => {
      const b = weekRef.current?.querySelector<HTMLElement>(`[data-day="${day}"]`);
      if (b) setPill({ x: b.offsetLeft, w: b.offsetWidth });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [day]);

  const list = events[day] ?? [];
  const nowM = now.getHours() * 60 + now.getMinutes();
  const heading =
    day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : (days[day]?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) ?? '');
  const next = day === 0 ? list.find((e) => e.meet && e.start + 30 > nowM) : undefined;
  let placed = day !== 0;
  const rows: Array<{ kind: 'now' } | { kind: 'ev'; ev: Ev }> = [];
  for (const ev of list) {
    if (!placed && ev.start > nowM) {
      rows.push({ kind: 'now' });
      placed = true;
    }
    rows.push({ kind: 'ev', ev });
  }
  if (!placed) rows.push({ kind: 'now' });

  const open = rems.filter((r) => !done.has(r.id)).length;

  return (
    <motion.aside
      ref={scroller}
      aria-label="Today"
      style={{ maskImage: mask }}
      onScroll={(e) => {
        const on = e.currentTarget.scrollTop > 2;
        if (on === faded.current) return;
        faded.current = on;
        animate(fade, on ? 28 : 0, { duration: 0.2, ease: [0.23, 1, 0.32, 1] });
      }}
      className="hidden min-h-0 overflow-y-auto overscroll-contain border-l border-line px-5 pt-0.5 pb-6 [scrollbar-width:none] min-[1180px]:grid min-[1180px]:content-start min-[1180px]:gap-5"
    >
      <section>
        <div className="mb-2.5 flex items-center gap-2 text-[11px] leading-4 font-medium tracking-[0.08em] text-ink-3 uppercase">
          {heading}
          <span className="flex-1" />
          <span className="text-ink-4" title="Google Calendar · clara@larkline.co">
            <BrandLogo name="gcal" size={12} mono />
          </span>
        </div>
        <div ref={weekRef} role="tablist" aria-label="This week" className="relative mb-2.5 grid grid-cols-7">
          <motion.span
            className="absolute top-0 left-0 h-full rounded-[9px] bg-sel"
            initial={false}
            animate={{ x: pill.x, width: pill.w }}
            transition={ease(240)}
          />
          {days.map((d, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              data-day={i}
              aria-selected={i === day}
              onClick={() => setDay(i)}
              className="relative grid justify-items-center gap-px rounded-[9px] py-1.5 text-ink-3 active:scale-[0.96]"
            >
              <span className="text-micro text-ink-4">{d.toLocaleDateString('en-GB', { weekday: 'narrow' })}</span>
              <span
                className={cx(
                  'text-btn tabular-nums',
                  i === 0 ? 'font-medium text-accent-ink' : 'text-ink-2',
                  i === day && i !== 0 && 'font-medium text-ink',
                )}
              >
                {d.getDate()}
              </span>
              <span className={cx('size-[3px] rounded-full bg-ink-4', ((events[i]?.length ?? 0) === 0 || i === day) && 'invisible')} />
            </button>
          ))}
        </div>
        <div key={day} className="grid animate-rise gap-1.5 motion-reduce:animate-none">
          {rows.map((row, i) =>
            row.kind === 'now' ? (
              <div key={`now-${i}`} className="my-0.5 grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2.5">
                <span className="text-right text-caption text-accent-ink tabular-nums">
                  {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
                </span>
                <i className="relative h-px bg-accent-line before:absolute before:top-[-2.5px] before:left-0 before:size-1.5 before:-translate-x-1/2 before:rounded-full before:bg-accent before:content-['']" />
              </div>
            ) : (
              <EventRow
                key={row.ev.id}
                ev={row.ev}
                past={day === 0 && row.ev.start + 30 <= nowM}
                next={row.ev === next}
                nowM={nowM}
                sent={sent.has(row.ev.id)}
                onSend={() => {
                  const id = row.ev.id;
                  setSent((s) => new Set(s).add(id));
                  showToast(`Kee will join ${row.ev.meet} and send you the notes`, () => {
                    setSent((s) => {
                      const n = new Set(s);
                      n.delete(id);
                      return n;
                    });
                  });
                }}
                onJoin={() => showToast(`Opening ${row.ev.meet} · Kee is taking notes`)}
              />
            ),
          )}
          {list.length === 0 ? <div className="pt-1.5 pl-[62px] text-ui text-ink-3">Nothing on the calendar.</div> : null}
        </div>
      </section>
      <section className="border-t border-line pt-5">
        <div className="mb-2.5 flex items-center gap-2 text-[11px] leading-4 font-medium tracking-[0.08em] text-ink-3 uppercase">
          Reminders
          {open > 0 ? <span className="tracking-normal text-ink-4 tabular-nums">{open}</span> : null}
          <span className="flex-1" />
          <button type="button" aria-label="Add reminder" title="Add reminder" className="grid size-[22px] place-items-center rounded-md text-ink-3 hover:bg-hover hover:text-ink" onClick={() => setAdding(true)}>
            <IconPlus size={12} />
          </button>
        </div>
        <div>
          {adding ? (
            <AddReminder
              onCommit={(text) => {
                setRems((rs) => [{ id: `n${Date.now()}`, text, when: 'Today' }, ...rs]);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          ) : null}
          {rems.map((r) => (
            <ReminderRow
              key={r.id}
              rem={r}
              done={done.has(r.id)}
              onDone={() => {
                setDone((s) => new Set(s).add(r.id));
                showToast('Reminder done', () => {
                  setDone((s) => {
                    const n = new Set(s);
                    n.delete(r.id);
                    return n;
                  });
                });
              }}
            />
          ))}
        </div>
      </section>
    </motion.aside>
  );
}

function EventRow({
  ev, past, next, nowM, sent, onSend, onJoin,
}: {
  ev: Ev; past: boolean; next: boolean; nowM: number; sent: boolean; onSend: () => void; onJoin: () => void;
}) {
  const mins = Math.round(ev.start - nowM);
  return (
    <div className={cx('grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2.5', past && 'opacity-45', next && 'items-start')}>
      <span className={cx('text-right text-caption text-ink-3 tabular-nums', next && 'pt-[7px]')}>
        {fmt(ev.start)}
        {next ? <em className="block text-[11px] leading-[15px] text-accent-ink not-italic">{mins <= 0 ? 'Now' : `in ${mins} min`}</em> : null}
      </span>
      <div className={cx('flex items-center gap-2.5 rounded-lg bg-surface px-[11px] py-[7px]', next && 'flex-wrap pb-[9px] shadow-lift')}>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-btn font-normal text-ink">{ev.title}</b>
          <small className="block truncate text-caption text-ink-3">{ev.sub}</small>
        </div>
        {next ? (
          <div className="mt-[3px] flex w-full basis-full items-center justify-around gap-[5px]">
            {sent ? (
              <span className="inline-flex h-6 items-center gap-[5px] px-1 text-meta text-ink-2">
                <IconCheck size={11} className="text-ok" /> Kee joins
              </span>
            ) : (
              <Button size="xs" onClick={onSend} title="Kee joins without you and sends you the notes">Send Kee</Button>
            )}
            <Button size="xs" tone={sent ? 'default' : 'pri'} onClick={onJoin} title="You join, Kee takes the notes">
              Join with Kee
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReminderRow({ rem, done, onDone }: { rem: Reminder; done: boolean; onDone: () => void }) {
  return (
    <div
      className={cx('grid transition-[grid-template-rows,opacity] duration-200', done ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]')}
      style={{ transitionDelay: done ? '1100ms' : '0ms' }}
    >
      <div className="overflow-hidden">
        <div className="flex items-start gap-2 py-[7px]">
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={`Done: ${rem.text}`}
            onClick={onDone}
            className={cx(
              'mt-0.5 grid size-[15px] shrink-0 place-items-center rounded-full border-[1.5px] border-ink-4 text-bg active:scale-90',
              done && 'border-ink-3 bg-ink-3',
            )}
          >
            <IconCheck size={9} className={cx('transition-opacity', done ? 'opacity-100' : 'opacity-0')} />
          </button>
          <div>
            <div className={cx('line-clamp-2 text-btn text-ink', done && 'text-ink-3 line-through decoration-ink-4')}>{rem.text}</div>
            <div className="mt-0.5 text-caption text-ink-3">
              <span className={cx(rem.soon && !done ? 'text-accent-ink' : done ? '' : 'text-ink-2')}>{rem.when}</span>
              {rem.from ? ` · ${rem.from}` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddReminder({ onCommit, onCancel }: { onCommit: (text: string) => void; onCancel: () => void }) {
  return (
    <div className="flex animate-rise items-center gap-2 py-[7px] motion-reduce:animate-none">
      <span className="size-[15px] shrink-0 rounded-full border border-dashed border-ink-4" />
      <input
        autoFocus
        aria-label="New reminder"
        placeholder="Remind me to…"
        className="bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
          if (e.key === 'Enter' && e.currentTarget.value.trim()) onCommit(e.currentTarget.value.trim());
        }}
        onBlur={(e) => {
          if (!e.currentTarget.value.trim()) onCancel();
        }}
      />
    </div>
  );
}
