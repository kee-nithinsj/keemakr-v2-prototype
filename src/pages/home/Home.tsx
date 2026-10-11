import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { AppBar } from '@/components/shell/Shell';
import { useShell } from '@/components/shell/shell-context';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconArrowUp, IconCal, IconChat, IconChevronDown, IconChevronLeft, IconChevronRight, IconLink, IconMail, IconMeet, IconPlus, IconReport, IconRetry, IconTable, IconX } from '@/components/ui/icons';
import { HAPS, NEEDS, QUESTIONS } from '@/data/fixtures';
import type { Hap, HapIcon, Need, NeedAction } from '@/data/types';
import { cx } from '@/lib/cx';
import { sleep } from '@/lib/time';
import { canvas, canvasLight } from '@/lib/ui';
import { Sky, SKY_LABEL, nextSky, type SkyName } from './Sky';
import { Today } from './Today';
import { useFrictionScroll } from './useFriction';

const HAP_ICON: Record<HapIcon, typeof IconTable> = {
  table: IconTable, cal: IconCal, chat: IconChat, report: IconReport, retry: IconRetry, mail: IconMail, meet: IconMeet, link: IconLink,
};

const KEYS = ['A', 'B', 'C', 'D'] as const;

/** Inside another page's frame (the marketing site), the sky banner is left out. */
const EMBEDDED = window.self !== window.top;

export function Home() {
  const { theme, setHomeCount, showToast } = useShell();
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);
  const [sky, setSky] = useState<SkyName>(theme === 'light' ? 'sun' : 'night');
  const [closed, setClosed] = useState<Set<string>>(() => new Set());
  const [haps, setHaps] = useState<Hap[]>(HAPS);
  const [more, setMore] = useState(false);
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<Map<number, number>>(() => new Map());
  const [other, setOther] = useState<Map<number, string>>(() => new Map());
  const [answered, setAnswered] = useState<Set<number>>(() => new Set());
  const [qsOpen, setQsOpen] = useState(false);
  const [qsGone, setQsGone] = useState(false);
  const [ask, setAsk] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  useFrictionScroll(feedRef);
  const fade = useMotionValue(0);
  const mask = useTransform(fade, (v) => `linear-gradient(to bottom, transparent 0, #000 ${v}px, #000 calc(100% - 28px), transparent 100%)`);
  const faded = useRef(false);

  const openNeeds = NEEDS.filter((n) => !closed.has(n.id));
  const questionsLeft = QUESTIONS.length - answered.size;
  const count = openNeeds.length + (qsGone || questionsLeft === 0 ? 0 : 1);

  useEffect(() => setHomeCount(count), [count, setHomeCount]);
  useEffect(() => setSky(theme === 'light' ? 'sun' : 'night'), [theme]);

  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const clock = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  const part = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
  const weather = SKY_LABEL[sky];

  function dismiss(id: string) {
    setClosed((s) => new Set(s).add(id));
    showToast('Dismissed · Kee will bring it back tomorrow', () => {
      setClosed((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    });
  }

  async function act(need: Need, action: NeedAction) {
    if (action.kind === 'link') return;
    if (action.kind === 'report') {
      showToast('The report opens on its own page');
      return;
    }
    setBusy(need.id);
    await sleep(action.kind === 'approve' ? 550 : 900);
    setClosed((s) => new Set(s).add(need.id));
    setBusy(null);
    if (action.kind === 'approve') {
      setHaps((hs) => [{ id: `a${Date.now()}`, icon: 'mail', lead: 'You approved 20 emails', rest: 'to Austin clinics · sending now', at: 'now' }, ...hs]);
      showToast('Approved · Kee is sending the 20 emails');
    } else {
      setHaps((hs) => [{ id: `a${Date.now()}`, icon: 'link', lead: 'Instagram reconnected', rest: '· Kee is replying to 2 messages', at: 'now' }, ...hs]);
      showToast('Instagram is connected again');
    }
  }

  const q = QUESTIONS[qi];
  const selected = pick.get(qi);
  const otherText = other.get(qi) ?? '';
  const canGo = selected !== undefined && (selected !== 3 || otherText.trim().length > 0);

  function choose(i: number) {
    setPick((m) => new Map(m).set(qi, i));
  }

  async function finish() {
    setQsGone(true);
    setHaps((hs) => [{ id: `q${Date.now()}`, icon: 'chat', lead: `You answered ${QUESTIONS.length} questions`, rest: '· Kee picked the work back up', at: 'now' }, ...hs]);
    showToast('Kee has your answers');
  }

  function nextQ() {
    if (!canGo) return;
    const nextAnswered = new Set(answered).add(qi);
    setAnswered(nextAnswered);
    const open = QUESTIONS.findIndex((_, i) => !nextAnswered.has(i));
    if (open === -1) void finish();
    else setQi(open);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (qsGone || !qsOpen) return;
      const k = KEYS.indexOf(e.key.toUpperCase() as (typeof KEYS)[number]);
      if (k !== -1) {
        e.preventDefault();
        choose(k);
      } else if (e.key === 'Enter' && canGo) {
        e.preventDefault();
        nextQ();
      } else if (e.key === 'ArrowRight') setQi((n) => Math.min(QUESTIONS.length - 1, n + 1));
      else if (e.key === 'ArrowLeft') setQi((n) => Math.max(0, n - 1));
      else if (e.key === 'Escape') setQsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // choose/nextQ close over the latest question index on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qsGone, qsOpen, qi, canGo, selected, otherText]);

  async function askKee() {
    const text = ask.trim();
    if (!text) return;
    navigate(`/chat/new?q=${encodeURIComponent(text)}`);
  }

  return (
    <main className={cx(canvas, 'grid grid-rows-[auto_minmax(0,1fr)] text-body')} style={theme === 'light' ? canvasLight : undefined}>
      <AppBar />
      <section className="grid min-h-0 grid-rows-[minmax(0,1fr)]">
        <div className="relative flex min-h-0 flex-col overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--wb-dot)_0.55px,transparent_0.65px)] [background-size:var(--wb-size)_var(--wb-size)]"
          />
          {EMBEDDED ? <div className="h-10 shrink-0" /> : <Sky sky={sky} theme={theme} onCycle={() => setSky((s) => nextSky(s))} />}
          <div className="relative grid min-h-0 flex-1 grid-cols-1 min-[1180px]:grid-cols-[minmax(0,1fr)_340px]">
            <div className="relative grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto]">
              <div className="pb-[18px]">
                <div className="mx-auto w-[min(880px,calc(100%-96px))]">
                  <header className="animate-rise motion-reduce:animate-none">
                    <div className="text-meta text-ink-3 tabular-nums">
                      {date} · {clock} · San Francisco, {weather.charAt(0).toLowerCase() + weather.slice(1)}
                    </div>
                    <h1 className="mt-2 mb-1.5 text-greeting font-medium tracking-[-0.02em] text-ink">Good {part}, Clara</h1>
                    <p className="text-lead text-ink-3">
                      {count > 0 ? (
                        <><b className="font-normal text-ink-2">{count} thing{count === 1 ? '' : 's'} need{count === 1 ? 's' : ''} you.</b> Kee handled 31 today.</>
                      ) : (
                        'Nothing needs you. Kee handled 31 things today.'
                      )}
                    </p>
                  </header>
                </div>
              </div>
              <motion.div
                ref={feedRef}
                style={{ maskImage: mask }}
                onScroll={(e) => {
                  const on = e.currentTarget.scrollTop > 2;
                  if (on === faded.current) return;
                  faded.current = on;
                  animate(fade, on ? 28 : 0, { duration: 0.2, ease: [0.23, 1, 0.32, 1] });
                }}
                className="min-h-0 overflow-y-auto overscroll-y-none pb-8 [scrollbar-width:none]"
              >
                <div className="relative">
                  <div className="mx-auto w-[min(880px,calc(100%-96px))]">
                      <section className="mt-7" aria-label="Needs you">
                        <h2 className="mb-3 flex items-center gap-2 text-[11px] leading-4 font-medium tracking-[0.08em] text-ink-3 uppercase">
                          Needs you <span className="tracking-normal text-ink-4 tabular-nums">{count}</span>
                        </h2>
                        <AnimatePresence initial={false}>
                          {openNeeds.map((need, i) => (
                            <motion.div key={need.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.24 }}>
                              {i === 0 ? (
                                <Focal need={need} busy={busy === need.id} onDismiss={() => dismiss(need.id)} onAct={(a) => void act(need, a)} />
                              ) : (
                                <NeedRow need={need} onDismiss={() => dismiss(need.id)} onAct={(a) => void act(need, a)} />
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {openNeeds.length === 0 ? <p className="animate-rise text-body text-ink-3">You're all caught up. Kee will add anything new here.</p> : null}
                      </section>
                      <section className="mt-12" aria-label="What happened">
                        <h2 className="mb-3 text-[11px] leading-4 font-medium tracking-[0.08em] text-ink-3 uppercase">What happened</h2>
                        {haps.slice(0, 5).map((h) => <HapRow key={h.id} hap={h} onPlain={() => showToast('This would open the result')} />)}
                        <div className={cx('grid transition-[grid-template-rows] duration-300 ease-kee', more ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                          <div className="overflow-hidden">
                            {haps.slice(5).map((h) => <HapRow key={h.id} hap={h} onPlain={() => showToast('This would open the result')} />)}
                          </div>
                        </div>
                        {haps.length > 5 ? (
                          <button type="button" className="mt-1.5 -ml-2 h-6 rounded-md px-2 text-meta text-ink-3 hover:bg-hover hover:text-ink" onClick={() => setMore((v) => !v)}>
                            {more ? 'Show less' : `Show ${haps.length - 5} more`}
                          </button>
                        ) : null}
                      </section>
                  </div>
                </div>
              </motion.div>
              <div className="pb-[22px]">
                <div className="mx-auto grid w-[min(880px,calc(100%-96px))]">
                  <div className={cx('grid transition-[grid-template-rows,opacity,margin] duration-200', qsGone ? 'mb-0 grid-rows-[0fr] opacity-0' : 'mb-2 grid-rows-[1fr]')}>
                    <div className="overflow-hidden">
                      <div className="rounded-[14px] border border-edge bg-surface shadow-lift" role="group" aria-label="Kee's questions">
                        <button type="button" className="flex h-[38px] w-full items-center gap-2 px-3.5 pr-2 text-ui text-ink-3" onClick={() => setQsOpen((v) => !v)}>
                          <span className={cx('size-1.5 rounded-full bg-accent', qsOpen && 'hidden')} />
                          <span className={qsOpen ? 'text-ink-2' : 'text-ink-2'}>{qsOpen ? 'Questions' : `Kee has ${questionsLeft} question${questionsLeft === 1 ? '' : 's'} for you`}</span>
                          {qsOpen && q ? (
                            <span className="min-w-0 truncate text-ink-3">
                              · {q.to ? <Link to={q.to} className="hover:text-ink" onClick={(e) => e.stopPropagation()}>{q.source}</Link> : q.source}
                            </span>
                          ) : null}
                          <span className="flex-1" />
                          <span className="grid size-[26px] place-items-center">
                            <IconChevronDown className={cx('transition-transform duration-200', qsOpen && 'rotate-180')} />
                          </span>
                        </button>
                        <div className={cx('grid transition-[grid-template-rows] duration-200 ease-kee', qsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                          <div className="overflow-hidden">
                            {q ? (
                              <div key={qi} className="animate-rise motion-reduce:animate-none">
                                <p className="px-3.5 pb-2 font-medium text-ink">{q.text}</p>
                                <div className="grid gap-px px-1.5" role="radiogroup">
                                  {q.options.map((opt, i) => (
                                    <button key={opt} type="button" role="radio" aria-checked={selected === i} onClick={() => choose(i)} className={cx('flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-body text-ink-2 hover:bg-hover hover:text-ink', selected === i && 'bg-sel text-ink')}>
                                      <span className={cx('grid size-5 place-items-center rounded-[5px] bg-chip text-[11px] font-medium text-ink-3', selected === i && 'bg-accent-soft text-accent-ink')}>{KEYS[i]}</span>
                                      <span>{opt}{i === q.recommended ? <span className="text-ink-3"> (Recommended)</span> : null}</span>
                                    </button>
                                  ))}
                                  <button type="button" role="radio" aria-checked={selected === 3} onClick={() => choose(3)} className={cx('flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-body text-ink-3 hover:bg-hover hover:text-ink', selected === 3 && 'bg-sel text-ink')}>
                                    <span className={cx('grid size-5 shrink-0 place-items-center rounded-[5px] bg-chip text-[11px] font-medium text-ink-3', selected === 3 && 'bg-accent-soft text-accent-ink')}>D</span>
                                    {selected === 3 ? (
                                      <input
                                        autoFocus
                                        value={otherText}
                                        placeholder="Tell Kee what to do"
                                        onChange={(e) => setOther((m) => new Map(m).set(qi, e.target.value))}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nextQ(); } }}
                                        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
                                      />
                                    ) : <span>Other…</span>}
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 pt-2.5 pr-2.5 pb-2.5 pl-3">
                                  <span className="inline-flex items-center gap-0.5 text-meta text-ink-3 tabular-nums">
                                    <button type="button" aria-label="Previous question" disabled={qi === 0} onClick={() => setQi((n) => n - 1)} className="grid size-5 place-items-center rounded-[5px] hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-35"><IconChevronLeft size={10} /></button>
                                    {qi + 1} of {QUESTIONS.length}
                                    <button type="button" aria-label="Next question" disabled={qi === QUESTIONS.length - 1} onClick={() => setQi((n) => n + 1)} className="grid size-5 place-items-center rounded-[5px] hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-35"><IconChevronRight size={10} /></button>
                                  </span>
                                  <span className="flex-1" />
                                  <Button size="sm" tone="plain" onClick={() => {
                                    const n = QUESTIONS.findIndex((_, i) => i !== qi && !answered.has(i));
                                    if (n !== -1) setQi(n);
                                  }}>Skip</Button>
                                  <Button size="sm" tone="pri" disabled={!canGo} onClick={nextQ}>
                                    {answered.size === QUESTIONS.length - 1 && !answered.has(qi) ? 'Submit' : 'Continue'} <IconArrowRight size={11} />
                                  </Button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[14px] border border-edge bg-surface shadow-lift transition-colors focus-within:border-accent-line">
                    <textarea
                      rows={1}
                      value={ask}
                      placeholder="Ask Kee anything"
                      onChange={(e) => {
                        setAsk(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void askKee(); } }}
                      className="block max-h-[180px] min-h-[34px] w-full resize-none bg-transparent px-3.5 pt-2.5 pb-0.5 leading-[22px] text-ink outline-none placeholder:text-ink-3"
                    />
                    <div className="flex items-center gap-1 px-2 pt-1 pb-2">
                      <button type="button" aria-label="Attach" className="inline-flex h-[26px] items-center rounded-md px-2 text-ink-3 hover:bg-hover hover:text-ink"><IconPlus size={13} /></button>
                      <span className="flex-1" />
                      <button type="button" aria-label="Ask Kee" onClick={() => void askKee()} className={cx('grid size-[26px] place-items-center rounded-full bg-send-off text-bg', ask.trim() && 'bg-accent text-on-accent active:scale-95')}>
                        <IconArrowUp size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Today />
          </div>
        </div>
      </section>
    </main>
  );
}

function Focal({ need, busy, onDismiss, onAct }: { need: Need; busy: boolean; onDismiss: () => void; onAct: (a: NeedAction) => void }) {
  return (
    <SwipeCard onDismiss={onDismiss} className="group relative rounded-[10px] border border-accent-line bg-surface px-3.5 pt-3.5 pb-3 shadow-lift">
      <div className="pr-7 text-meta text-ink-3">{need.kind}</div>
      <div className="mt-[5px] text-card font-medium tracking-[-0.005em] text-ink">{need.title}</div>
      <p className="mt-1 text-[13.5px] leading-[21px] text-ink-2">{need.detail}</p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {need.actions.map((a) =>
          a.kind === 'link' ? (
            <Button key={a.label} to={a.to} tone={a.primary ? 'pri' : 'default'}>{a.label}</Button>
          ) : (
            <Button key={a.label} tone={a.primary ? 'pri' : 'default'} disabled={busy} onClick={() => onAct(a)}>
              {busy && a.primary ? 'Sending…' : a.label}
            </Button>
          ),
        )}
        <span className="flex-1" />
        <Button tone="plain" onClick={onDismiss}>Not now</Button>
      </div>
      <button type="button" aria-label="Dismiss" onClick={onDismiss} className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-[7px] text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-hover hover:text-ink">
        <IconX size={10} />
      </button>
    </SwipeCard>
  );
}

function NeedRow({ need, onDismiss, onAct }: { need: Need; onDismiss: () => void; onAct: (a: NeedAction) => void }) {
  return (
    <SwipeCard onDismiss={onDismiss} className="group mt-0.5 grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[10px] px-3 py-[11px] hover:bg-hover">
      <span className="text-ink-3">
        {need.icon === 'people' ? (
          <AvatarStack>
            <Avatar face="maya" initials="ME" size="xs" />
            <Avatar face="priya" initials="PN" size="xs" />
          </AvatarStack>
        ) : need.icon === 'report' ? (
          <IconReport size={15} />
        ) : (
          <BrandLogo name={need.icon} size={15} mono />
        )}
      </span>
      <div className="min-w-0">
        <div className="font-medium text-ink">{need.title}</div>
        <div className="mt-px text-meta text-ink-3">{need.detail}</div>
      </div>
      <div className="flex h-[21px] items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        {need.actions.map((a) =>
          a.kind === 'link' ? <Button key={a.label} size="sm" to={a.to}>{a.label}</Button> : <Button key={a.label} size="sm" onClick={() => onAct(a)}>{a.label}</Button>,
        )}
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className="grid size-6 place-items-center rounded-[7px] text-ink-3 hover:bg-hover hover:text-ink"><IconX size={10} /></button>
      </div>
    </SwipeCard>
  );
}

function SwipeCard({ children, onDismiss, className }: { children: ReactNode; onDismiss: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={cx('touch-pan-y', className)}
      onPointerDown={(e) => {
        const card = ref.current;
        if (!card || (e.target as HTMLElement).closest('button, a') || e.button !== 0) return;
        const x0 = e.clientX;
        const t0 = performance.now();
        let dx = 0;
        let dragging = false;
        const move = (ev: PointerEvent) => {
          dx = ev.clientX - x0;
          if (!dragging && Math.abs(dx) > 4) dragging = true;
          if (dragging) {
            card.style.transform = `translateX(${dx}px)`;
            card.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 420));
          }
        };
        const up = () => {
          removeEventListener('pointermove', move);
          removeEventListener('pointerup', up);
          if (!dragging) return;
          const v = Math.abs(dx) / (performance.now() - t0);
          if (Math.abs(dx) > 110 || v > 0.5) onDismiss();
          else {
            card.style.transform = '';
            card.style.opacity = '';
          }
        };
        addEventListener('pointermove', move);
        addEventListener('pointerup', up);
      }}
    >
      {children}
    </div>
  );
}

function HapRow({ hap, onPlain }: { hap: Hap; onPlain: () => void }) {
  const Icon = HAP_ICON[hap.icon];
  const cls = 'grid h-8 w-[calc(100%+16px)] -mx-2 grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 text-left text-body text-ink-2 no-underline hover:bg-hover';
  const inner = (
    <>
      <span className="grid place-items-center text-ink-4"><Icon size={14} /></span>
      <span className="truncate"><b className="font-normal text-ink">{hap.lead}</b> {hap.rest}</span>
      <span className="text-meta text-ink-3 tabular-nums">{hap.at}</span>
    </>
  );
  if (hap.to) return <Link to={hap.to} className={cls}>{inner}</Link>;
  return <button type="button" className={cls} onClick={onPlain}>{inner}</button>;
}
