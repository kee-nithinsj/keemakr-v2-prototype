import { useEffect, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IconButton } from '@/components/ui/Button';
import { Dotm } from '@/components/ui/Dotm';
import { KeeMark } from '@/components/ui/KeeMark';
import { IconArrowUp, IconCal, IconChat, IconCheck, IconChevronRight, IconPeople, IconPlus, IconSearch, IconSidebar } from '@/components/ui/icons';
import { useShell } from '@/components/shell/shell-context';
import { CHATS } from '@/data/fixtures';
import { cx } from '@/lib/cx';
import { Markup } from '@/lib/markup';
import { sleep, partOfDay } from '@/lib/time';
import { canvas, canvasLight } from '@/lib/ui';
import { streamInto } from './stream';

const CLINICS: Array<[string, string]> = [
  ['Zilker Family Clinic', '4.9 · 612'], ['Premier Dental Austin', '4.9 · 488'], ['South Congress Health', '4.8 · 931'],
  ['Rosewood Family Medicine', '4.8 · 377'], ['Oak Hill Medical', '4.8 · 402'], ['Barton Hills Pediatrics', '4.8 · 290'],
  ['Westlake Family Health', '4.7 · 744'], ['Mueller Clinic', '4.7 · 515'], ['Crestview Family Care', '4.7 · 268'],
  ['Tarrytown Health', '4.7 · 330'], ['East Side Medicine', '4.7 · 452'], ['Burnet Road Dental', '4.7 · 219'],
  ['Hyde Park Clinic', '4.6 · 384'], ['Bouldin Creek Health', '4.6 · 201'], ['Allandale Family', '4.6 · 257'],
  ['North Loop Medical', '4.6 · 318'], ['Travis Heights Dental', '4.6 · 190'], ['Clarksville Care', '4.6 · 233'],
  ['Windsor Park Clinic', '4.5 · 412'], ['Cherrywood Health', '4.5 · 176'],
];

const SUGS = [
  { icon: 'cal' as const, title: 'Prep me for the Maya Ellison call', meta: 'Meetings · your next call', q: 'Prep me for my call with Dr. Maya Ellison: who she is, what she asked on WhatsApp, and what I should offer.' },
  { icon: 'msg' as const, title: 'Draft a reply to Priya about 20% off', meta: 'Sales · waiting 2h', q: 'Draft a reply to Priya about the 20% discount she asked for.' },
  { icon: 'find' as const, title: 'Find seed-stage founders hiring a designer', meta: 'Sales', q: 'Find 30 seed-stage founders in fintech hiring their first designer.' },
  { icon: 'ppl' as const, title: 'Screen the new engineer applicants', meta: 'Recruiting · 40 new', q: 'Screen the 40 new applicants for the founding engineer role.' },
];

type Block =
  | { id: string; k: 'user'; text: string }
  | { id: string; k: 'think' }
  | { id: string; k: 'step'; label: string; details: string[]; open: boolean; live: boolean }
  | { id: string; k: 'kee'; text: string; live: boolean; faint?: boolean }
  | { id: string; k: 'card' };

type Row = { name: string; meta: string; drafted: boolean };
type Card = { count: number; status: string; now: string; rows: Row[]; done: boolean; stopped: boolean };
type Approval =
  | { kind: 'send'; phase: 'ask' | 'hold' | 'sent' }
  | { kind: 'plan'; picked: string | null };

/** Survives switching chats, resets when the chat page unmounts (a fresh visit, like the prototype). */
let austinSent = false;

let seq = 0;
const nid = () => `b${++seq}`;

export function Chat() {
  const { id: rawId } = useParams();
  const id = rawId || 'austin';
  const [params, setParams] = useSearchParams();
  const handed = params.get('q');
  const navigate = useNavigate();
  const { theme, setSideOpen, showToast } = useShell();
  const [empty, setEmpty] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const [approval, setApproval] = useState<Approval | null>(null);
  const [chip, setChip] = useState<'live' | 'ask' | null>('live');
  const [draft, setDraft] = useState('');
  const [run, setRun] = useState(0);
  const gen = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const doneRef = useRef(new Map<string, () => void>());
  const approvalRef = useRef(approval);
  approvalRef.current = approval;
  const aliveRef = useRef<() => boolean>(() => false);

  useEffect(() => {
    const mine = ++gen.current;
    const alive = () => gen.current === mine;
    aliveRef.current = alive;
    setBlocks([]);
    setCard(null);
    setApproval(null);
    const box = threadRef.current;
    if (box) box.scrollTop = 0;
    void openChat(id, handed, alive);
    return () => { gen.current += 1; };
    // handed is read once per navigation; openChat closes over the latest helpers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, run]);

  useEffect(() => () => { austinSent = false; }, []);

  useEffect(() => {
    const box = threadRef.current;
    if (!box) return;
    if (box.scrollHeight - box.scrollTop - box.clientHeight < 160) box.scrollTop = box.scrollHeight;
  }, [blocks, card, approval]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const pending = approvalRef.current;
        if (pending?.kind === 'send' && pending.phase === 'ask') {
          e.preventDefault();
          void finishSend();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function push(b: Block) {
    setBlocks((xs) => [...xs, b]);
    return b.id;
  }
  function patch(bid: string, fn: (b: Block) => Block) {
    setBlocks((xs) => xs.map((b) => (b.id === bid ? fn(b) : b)));
  }
  function whenStreamed(bid: string) {
    return new Promise<void>((resolve) => { doneRef.current.set(bid, resolve); });
  }

  async function openChat(chatId: string, q: string | null, alive: () => boolean) {
    if (chatId === 'new') {
      if (q) {
        setParams({}, { replace: true });
        setEmpty(false);
        await answer(q, alive);
        return;
      }
      setEmpty(true);
      setChip(austinSent ? null : chipOf());
      return;
    }
    setEmpty(false);
    const known = CHATS.find((c) => c.id === chatId);
    if (chatId === 'austin') return austin(alive);
    if (chatId === 'plan') return plan(alive);
    return recap(known?.title ?? chatId, chatId === 'acme', alive);
  }

  function chipOf(): 'live' | 'ask' | null {
    return austinSent ? null : 'live';
  }

  async function austin(alive: () => boolean) {
    push({ id: nid(), k: 'user', text: 'Find the twenty best clinics in Austin and draft the intro emails.' });
    if (austinSent) {
      setChip(null);
      push({ id: nid(), k: 'step', label: '<b>Searched</b> 2 sources · 148 clinics', details: [], open: false, live: false });
      push({ id: nid(), k: 'step', label: '<b>Read</b> 240 reviews', details: [], open: false, live: false });
      push({ id: nid(), k: 'kee', text: 'Sent 20 emails · 3 replies so far', live: false, faint: true });
      return;
    }
    setChip('live');
    const think = nid();
    push({ id: think, k: 'think' });
    await sleep(1100);
    if (!alive()) return;
    patch(think, () => ({ id: think, k: 'step', label: '<b>Thought</b> for 1s', details: [], open: false, live: false }));
    const line = nid();
    const streamed = whenStreamed(line);
    push({ id: line, k: 'kee', text: "On it. I'll pull the twenty best-reviewed clinics in Austin, read their recent reviews so each email sounds like someone actually read them, and draft one intro per clinic. **Nothing sends until you say yes.**", live: true });
    await streamed;
    if (!alive()) return;

    const search = nid();
    push({
      id: search, k: 'step', live: true, open: false,
      label: '<b>Searching</b> Google Maps and Yelp',
      details: ['Google Maps — 148 clinics within city limits', 'Yelp — 96 matched, 52 merged as duplicates', 'Kept places with 150+ reviews and 4.5★ or better'],
    });
    await sleep(1400);
    if (!alive()) return;
    patch(search, (b) => (b.k === 'step' ? { ...b, live: false, label: '<b>Searched</b> 2 sources · 148 clinics' } : b));

    const reading = nid();
    push({
      id: reading, k: 'step', live: true, open: false,
      label: '<b>Reading</b> reviews',
      details: ['Read the latest 12 reviews for each clinic', 'Noted what patients praise, by name', 'Skipped 3 clinics with recent complaints about billing'],
    });
    push({ id: nid(), k: 'card' });
    setCard({ count: 0, status: 'Reading', now: 'Starting', rows: [], done: false, stopped: false });

    for (let i = 0; i < CLINICS.length; i++) {
      await sleep(260 + Math.random() * 260);
      if (!alive()) return;
      const pair = CLINICS[i];
      if (!pair) continue;
      const [name, meta] = pair;
      setCard((c) => c && {
        ...c,
        count: i + 1,
        now: `Reading ${name}`,
        rows: [...c.rows, { name, meta, drafted: false }],
      });
      rowsRef.current?.scrollTo({ top: rowsRef.current.scrollHeight });
      window.setTimeout(() => {
        if (!alive()) return;
        setCard((c) => c && {
          ...c,
          rows: c.rows.map((r) => (r.name === name ? { ...r, drafted: true } : r)),
        });
      }, 900);
    }
    await sleep(1000);
    if (!alive()) return;
    patch(reading, (b) => (b.k === 'step' ? { ...b, live: false, label: '<b>Read</b> 240 reviews' } : b));
    setCard((c) => c && { ...c, status: 'Drafts ready', now: '20 drafts · average 96 words', done: true });
    rowsRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    const close = nid();
    const streamedClose = whenStreamed(close);
    push({ id: close, k: 'kee', text: 'All twenty are drafted. Each one opens with something a real patient said, and asks for a 15-minute call next week.', live: true });
    await streamedClose;
    if (!alive()) return;
    setChip('ask');
    setApproval({ kind: 'send', phase: 'ask' });
  }

  async function plan(alive: () => boolean) {
    push({ id: nid(), k: 'user', text: 'Plan the Friday campaign for the nine new placements.' });
    push({ id: nid(), k: 'step', label: '<b>Read</b> 9 profiles and 2 calendars', details: [], open: false, live: false });
    push({ id: nid(), k: 'kee', text: 'The plan is ready. Seven of nine fit cleanly. Two things only you can decide:', live: false });
    setApproval({ kind: 'plan', picked: null });
    void alive;
  }

  async function recap(label: string, acme: boolean, alive: () => boolean) {
    push({ id: nid(), k: 'user', text: acme ? 'Write up the Acme call and send the recap.' : `Catch me up on ${label.toLowerCase()}.` });
    push({ id: nid(), k: 'step', label: '<b>Read</b> the transcript · 42 minutes', details: [], open: false, live: false });
    const text = acme
      ? 'Sent the recap to Ammaar and Haard. Three follow-ups are on your list, and the **pricing question is yours** to answer. The next call is booked for Thursday at 14:30.'
      : 'All done. Nothing is waiting on you here.';
    push({ id: nid(), k: 'kee', text, live: true });
    void alive;
  }

  async function answer(q: string, alive: () => boolean) {
    push({ id: nid(), k: 'user', text: q });
    const think = nid();
    push({ id: think, k: 'think' });
    await sleep(900);
    if (!alive()) return;
    patch(think, () => ({ id: think, k: 'step', label: '<b>Thought</b> for 1s', details: [], open: false, live: false }));
    const pending = approvalRef.current?.kind === 'send' && approvalRef.current.phase === 'ask';
    push({
      id: nid(), k: 'kee', live: true,
      text: pending
        ? "Noted — I'll fold that in. The 20 drafts are still waiting on your yes above."
        : "On it. I'll keep you posted here as it moves, and I'll ask before anything leaves your accounts.",
    });
  }

  async function submit(text?: string) {
    const q = (text ?? draft).trim();
    if (!q) return;
    setDraft('');
    if (taRef.current) taRef.current.style.height = '';
    if (empty) setEmpty(false);
    const mine = gen.current;
    await answer(q, () => gen.current === mine);
  }

  function finishSend() {
    const pending = approvalRef.current;
    if (!pending || pending.kind !== 'send' || pending.phase !== 'ask') return;
    austinSent = true;
    setApproval({ kind: 'send', phase: 'sent' });
    setChip(null);
    showToast('Sending started — 20 emails');
  }

  function stopHold() {
    gen.current += 1;
    setCard((c) => c && { ...c, now: 'Stopped. Nothing was sent.', stopped: true, done: true });
    showToast('Stopped — drafts kept');
  }

  async function pickPlan(day: string) {
    setApproval({ kind: 'plan', picked: day });
    await sleep(350);
    const follow = nid();
    const streamed = whenStreamed(follow);
    push({
      id: follow, k: 'kee', live: true,
      text: 'Got it. One left: the engineer trip, four days or five? I can book everything the moment you answer.',
    });
    await streamed;
  }

  const sugIcon = { cal: IconCal, msg: IconChat, find: IconSearch, ppl: IconPeople };

  return (
    <main
      className={cx(canvas, 'grid text-chat transition-[grid-template-rows] duration-[420ms] ease-kee', empty ? 'grid-rows-[minmax(0,1fr)_auto_minmax(0,1.15fr)]' : 'grid-rows-[minmax(0,1fr)_auto_minmax(0,0fr)]')}
      style={theme === 'light' ? canvasLight : undefined}
    >
      <div ref={threadRef} className="min-h-0 overflow-y-auto [scrollbar-width:none]">
        <div className={cx('mx-auto w-full max-w-[1008px] px-6 pb-10', empty ? 'grid h-full pt-2.5' : 'pt-6')}>
          <IconButton
            aria-label="Open sidebar"
            title="Open sidebar  ⌘B"
            onClick={() => setSideOpen(true)}
            className="mb-1 hidden group-data-[side=closed]:grid max-[760px]:grid"
          >
            <IconSidebar size={15} />
          </IconButton>
          {empty ? (
            <div className="grid content-end justify-items-center pb-[22px] text-center">
              <KeeMark size="lg" className="mb-4" />
              <h2 className="mb-1.5 text-[26px] leading-8 font-medium tracking-[-0.02em]">Good {partOfDay()}, Clara</h2>
              <p className="m-0 text-ink-3">Your call with <b className="font-normal text-ink-2">Dr. Maya Ellison</b> is next, and <b className="font-normal text-ink-2">Priya</b> is waiting on a reply.</p>
            </div>
          ) : (
            blocks.map((b, i) => (
              <BlockView
                key={b.id}
                block={b}
                first={i === 0}
                card={card}
                rowsRef={rowsRef}
                onToggle={() => patch(b.id, (x) => x.k === 'step' ? { ...x, open: !x.open } : x)}
                onStop={stopHold}
                onStreamed={b.k === 'kee' && b.live ? () => { doneRef.current.get(b.id)?.(); doneRef.current.delete(b.id); } : undefined}
              />
            ))
          )}
        </div>
      </div>

      <div className="pb-2">
        <div className="mx-auto w-full max-w-[1008px] px-6">
          {approval?.kind === 'send' && approval.phase !== 'sent' ? (
            <div className="mb-2 animate-rise rounded-[10px] border border-accent-line bg-surface px-3.5 pt-3.5 pb-3 shadow-lift">
              <div className="mb-1.5 font-medium text-ink">Send 20 emails from clara@larkline.co?</div>
              <p className="text-[13.5px] leading-[22.4px] text-ink-3">They go out one every few minutes so they don't land as a batch. Replies come back to this chat.</p>
              <div className="mt-3.5 flex items-center justify-end gap-2 border-t border-line pt-3">
                {approval.phase === 'hold' ? (
                  <span className="text-ink-3">Holding the drafts. Ask me when you're ready.</span>
                ) : (
                  <>
                    <button type="button" onClick={() => setApproval({ kind: 'send', phase: 'hold' })} className="inline-flex h-7 items-center rounded-md px-2.5 text-[12.5px] text-ink-2 hover:bg-hover hover:text-ink active:scale-[0.97]">Not yet</button>
                    <button type="button" onClick={finishSend} className="inline-flex h-7 items-center gap-2 rounded-md bg-accent px-2.5 text-[12.5px] font-medium text-on-accent hover:opacity-90 active:scale-[0.97]">Send <span className="text-[11px] font-normal opacity-55">⌘↵</span></button>
                  </>
                )}
              </div>
            </div>
          ) : null}
          {approval?.kind === 'send' && approval.phase === 'sent' ? (
            <div className="mb-2 flex items-center gap-2 rounded-[10px] border border-accent-line bg-surface px-4 py-3 text-ink-2 shadow-lift">
              <IconCheck size={13} className="text-ok" />
              <span>Sending 20 emails · first one went out just now</span>
            </div>
          ) : null}
          {approval?.kind === 'plan' ? (
            <div className="mb-2 animate-rise rounded-[10px] border border-accent-line bg-surface px-3.5 pt-3.5 pb-3 shadow-lift">
              {approval.picked ? (
                <div className="flex items-center gap-2 text-ink-2">
                  <IconCheck size={13} className="text-ok" />
                  <span>PM trip starts {approval.picked}</span>
                </div>
              ) : (
                <>
                  <div className="mb-1.5 font-medium text-ink">When does the PM trip start?</div>
                  <p className="text-[13.5px] leading-[22.4px] text-ink-3">Monday gives the team a buffer before the client visit. Wednesday saves two hotel nights.</p>
                  <div className="mt-2.5 grid gap-1.5">
                    {['Monday', 'Wednesday'].map((day, n) => (
                      <button key={day} type="button" onClick={() => void pickPlan(day)} className="flex w-full items-center gap-2.5 rounded-md border border-line-2 bg-card px-2.5 py-2 text-left text-ink-2 hover:border-ink-4 hover:text-ink active:scale-[0.98]">
                        <span className="grid size-[18px] shrink-0 place-items-center rounded bg-surface-2 text-[11px] leading-none text-ink-3">{n + 1}</span>
                        {day}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {chip && !empty ? (
            <div className="mb-2 flex items-center gap-2 text-meta text-ink-3">
              {chip === 'live' ? (
                <button
                  type="button"
                  onClick={() => { if (id === 'austin' && !austinSent) setRun((n) => n + 1); else navigate('/chat/austin'); }}
                  className="inline-flex items-center gap-2 text-left hover:text-ink-2"
                >
                  <Dotm className="origin-center scale-[0.72]" />
                  <span className="kee-status-shimmer">Kee is working</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <i className="size-[5px] rounded-full bg-ask" />
                  Kee needs you
                </span>
              )}
            </div>
          ) : null}

          <div className="flex min-h-10 items-end gap-1.5 rounded-2xl border border-edge bg-surface py-[8px] pr-[7px] pl-2.5 shadow-lift focus-within:border-accent-line">
            <button type="button" aria-label="Attach" className="my-[2.7px] grid size-[17px] shrink-0 place-items-center rounded-full bg-plus text-ink-3 hover:text-ink">
              <IconPlus size={9} strokeWidth={2} />
            </button>
            <textarea
              ref={taRef}
              rows={1}
              value={draft}
              placeholder="Ask Kee anything"
              onChange={(e) => {
                setDraft(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit(); } }}
              className="ml-0.5 block max-h-[180px] min-h-[22.4px] w-full flex-1 resize-none bg-transparent leading-[22.4px] text-ink caret-accent outline-none placeholder:text-ink-3"
            />
            <div className="flex h-[22.4px] shrink-0 items-center gap-1.5">
              <button type="button" className="inline-flex h-[22.4px] items-center gap-[5px] rounded px-1 text-meta text-ink-3 hover:bg-hover hover:text-ink">
                Sales <IconChevronDown />
              </button>
              <button type="button" aria-label="Talk" className="grid size-[22px] place-items-center text-ink-3 hover:text-ink"><IconMic size={13} /></button>
              <button type="button" aria-label="Send" onClick={() => void submit()} className={cx('grid size-[22px] place-items-center rounded-full bg-send-off text-bg', draft.trim() && 'bg-accent text-on-accent active:scale-95')}>
                <IconArrowUp size={12} />
              </button>
            </div>
          </div>

          {empty ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SUGS.map((s, n) => {
                const Icon = sugIcon[s.icon];
                return (
                  <button key={s.title} type="button" onClick={() => { setDraft(s.q); taRef.current?.focus(); }} style={{ animationDelay: `${120 + n * 40}ms` }} className="grid animate-rise grid-cols-[16px_minmax(0,1fr)] items-start gap-x-2.5 gap-y-[3px] rounded-[10px] border border-edge px-3 py-2.5 text-left hover:border-line-2 hover:bg-surface hover:[&_svg]:text-accent-ink">
                    <Icon size={14} className="mt-[2.5px] text-ink-3" />
                    <span className="truncate text-ink">{s.title}</span>
                    <span className="col-start-2 text-[12.5px] text-ink-3">{s.meta}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function StepLabel({ label, live }: { label: string; live: boolean }) {
  return (
    <span className={cx('grid h-[22px] overflow-hidden', live && 'animate-breathe')}>
      <AnimatePresence initial={false}>
        <motion.span
          key={label}
          initial={{ y: '100%', opacity: 0.55 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0.25 }}
          transition={{ duration: 0.36, ease: [0.23, 1, 0.32, 1] }}
          className="col-start-1 row-start-1 block h-[22px] leading-[22px] whitespace-nowrap"
        >
          <Markup text={label} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function IconChevronDown() {
  return <IconChevronRight size={10} className="rotate-90" />;
}
function IconMic(props: { size?: number }) {
  return (
    <svg width={props.size ?? 13} height={props.size ?? 13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <rect x="6" y="2" width="4" height="8" rx="2" />
      <path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" />
    </svg>
  );
}

function BlockView({ block, first, card, rowsRef, onToggle, onStop, onStreamed }: {
  block: Block;
  first: boolean;
  card: Card | null;
  rowsRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onStop: () => void;
  onStreamed?: () => void;
}) {
  if (block.k === 'user') {
    return <div className={cx('mb-[15px] w-full max-w-[744px] animate-rise rounded-lg border border-edge bg-surface px-[11px] py-2 text-ink shadow-lift', !first && 'mt-[22px]')}>{block.text}</div>;
  }
  if (block.k === 'think') {
    return <div className="mb-[13px] animate-breathe px-3 text-step">Thinking</div>;
  }
  if (block.k === 'step') {
    return (
      <>
        <button type="button" aria-expanded={block.open} onClick={block.details.length ? onToggle : undefined} className="group mb-[13px] flex items-center gap-1 px-3 text-step-2">
          <span className="text-left [&_b]:font-normal [&_b]:text-step group-hover:text-ink-2 group-hover:[&_b]:text-ink-2">
            <StepLabel label={block.label} live={block.live} />
          </span>
          {block.details.length ? <IconChevronRight size={10} className={cx('opacity-0 transition-opacity group-hover:opacity-100', block.open && 'rotate-90 opacity-100')} /> : null}
        </button>
        {block.details.length ? (
          <div className={cx('grid transition-[grid-template-rows] duration-200 ease-kee', block.open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <div className="overflow-hidden">
              <div className={cx('mt-[-6px] mr-3 mb-3 ml-4 grid gap-[3px] border-l border-line-2 py-0 pr-0 pl-3 text-[12.5px] text-ink-3', block.open ? 'opacity-100' : 'opacity-0')}>
                {block.details.map((d) => <span key={d}>{d}</span>)}
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }
  if (block.k === 'kee') {
    return (
      <div className={cx('mb-[13px] w-full max-w-[744px] px-3', block.faint && 'text-ink-3')}>
        {block.live ? <Stream text={block.text} onDone={onStreamed} /> : <p className="m-0"><Markup text={block.text} /></p>}
      </div>
    );
  }
  if (!card) return null;
  return (
    <div className="mx-3 mb-[13px] animate-rise overflow-hidden rounded-lg border border-line-2 bg-card">
      <div className="flex items-center gap-2.5 bg-surface px-3 py-[9px] text-[13.5px]">
        <span className="font-medium">Austin clinics</span>
        <span className="text-ink-3 tabular-nums">{card.count} of 20</span>
        <span className="flex-1" />
        <span className="inline-flex h-[22px] items-center gap-1.5 rounded-md bg-surface px-2 text-[12.5px] text-ink-2">
          <i className={cx('size-[5px] rounded-full', card.done ? 'bg-ok' : 'animate-breathe bg-signal')} />
          {card.status}
        </span>
      </div>
      <div className={cx('h-0.5 origin-top overflow-hidden bg-line transition-opacity duration-200', card.done && 'scale-y-0 opacity-0')}>
        <i className="block h-full origin-left bg-ink-3 transition-transform duration-300 ease-kee" style={{ transform: `scaleX(${card.count / 20})` }} />
      </div>
      <div ref={rowsRef} className="max-h-[232px] overflow-auto [scrollbar-width:thin]">
        {card.rows.map((r) => (
          <div key={r.name} className="grid animate-rowin grid-cols-[18px_minmax(0,1fr)_auto_auto] items-center gap-2.5 border-t border-line px-3 py-[7px] text-[13.5px] text-ink-2 first:border-t-0">
            <IconCheck size={13} className="text-ink-3" />
            <span className="truncate text-ink">{r.name}</span>
            <span className="text-[12.5px] text-ink-3 tabular-nums">{r.meta}</span>
            <span className={cx('min-w-16 text-right text-[12.5px]', r.drafted ? 'text-ink-2' : 'text-ink-3')}>{r.drafted ? 'Drafted' : 'Draft…'}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-line px-3 py-2 text-[12.5px] text-ink-3">
        <span>{card.now}</span>
        <span className="flex-1" />
        {card.stopped || card.done ? (
          card.stopped ? null : <button type="button" className="rounded px-1.5 py-0.5 text-ink-2 hover:bg-hover hover:text-ink">Open drafts</button>
        ) : (
          <HoldButton onStop={onStop} />
        )}
      </div>
    </div>
  );
}

function HoldButton({ onStop }: { onStop: () => void }) {
  const timer = useRef(0);
  const [holding, setHolding] = useState(false);
  const end = () => { window.clearTimeout(timer.current); setHolding(false); };
  return (
    <button
      type="button"
      className="relative overflow-hidden rounded px-1.5 py-0.5 text-ink-2 hover:bg-hover hover:text-ink"
      onPointerDown={() => { setHolding(true); timer.current = window.setTimeout(onStop, 900); }}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
    >
      <span className={cx('pointer-events-none absolute inset-0 origin-left bg-[rgba(255,107,44,0.2)]', holding ? 'scale-x-100 transition-transform duration-[900ms] ease-linear' : 'scale-x-0 transition-transform duration-200 ease-kee')} />
      <span className="relative">Hold to stop</span>
    </button>
  );
}

function Stream({ text, onDone }: { text: string; onDone?: () => void }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    let dead = false;
    void streamInto(p, text, () => dead).then(() => { if (!dead) done.current?.(); });
    return () => { dead = true; };
  }, [text]);
  return <p ref={ref} className="m-0" />;
}
