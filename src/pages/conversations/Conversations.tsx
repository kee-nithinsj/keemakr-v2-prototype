import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { AppBar } from '@/components/shell/Shell';
import { useShell } from '@/components/shell/shell-context';
import { Avatar } from '@/components/ui/Avatar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { KeeMark } from '@/components/ui/KeeMark';
import { IconArrowRight, IconArrowUp, IconCal, IconCheck, IconGlobe, IconHand, IconLink, IconShield } from '@/components/ui/icons';
import { CHANNEL, CONVOS, PEOPLE, mid, type Person } from '@/data/inbox';
import type { ActIcon, Channel, Conversation, Msg, Owner } from '@/data/types';
import { cx } from '@/lib/cx';
import { Markup } from '@/lib/markup';
import { ease } from '@/lib/motion';
import { sleep } from '@/lib/time';
import { canvas } from '@/lib/ui';

const inboxLight = { '--sel': '#e4e4e4', '--surface-2': '#e8e8e8' } as CSSProperties;
const btn = 'inline-flex h-7 items-center gap-[7px] rounded-[7px] border border-line-2 bg-transparent px-[11px] text-[12.5px] text-ink-2 hover:bg-hover hover:text-ink active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';
const btnPri = 'inline-flex h-7 items-center gap-[7px] rounded-[7px] border border-transparent bg-accent px-[11px] text-[12.5px] font-medium text-on-accent hover:opacity-90 active:scale-[0.97]';
const btnPlain = 'inline-flex h-7 items-center rounded-[7px] border border-transparent px-[11px] text-[12.5px] text-ink-2 hover:bg-hover hover:text-ink';

const STAFF = { jess: { name: 'Jess Park', initials: 'JP', face: 'jess' as const } };

type Lens = 'you' | 'kee' | 'all';
type Pop =
  | { kind: 'pick'; left: number; top: number }
  | { kind: 'link'; which: 'booking' | 'verify'; left: number; bottom: number };

function firstName(name: string) {
  return name.replace(/^Dr\. /, '').split(' ')[0] ?? name;
}
function ownerLabel(c: Conversation) {
  if (c.owner === 'kee') return 'Kee';
  if (c.owner === 'me') return 'You';
  return STAFF.jess.name.split(' ')[0] ?? 'Jess';
}
function preview(c: Conversation) {
  const m = [...c.msgs].reverse().find((x) => x.k === 'in' || x.k === 'kee' || x.k === 'staff' || x.k === 'me');
  if (!m || m.k === 'day' || m.k === 'act' || m.k === 'draft') return '';
  const who = m.k === 'in' ? '' : m.k === 'kee' ? 'Kee: ' : m.k === 'me' ? 'You: ' : 'Jess: ';
  return who + m.text;
}

export function Conversations() {
  const { theme, setInboxCount, showToast } = useShell();
  const [people, setPeople] = useState(() => structuredClone(PEOPLE));
  const [convos, setConvos] = useState(() => structuredClone(CONVOS));
  const [lens, setLens] = useState<Lens>('you');
  const [currentId, setCurrentId] = useState('maya-wa');
  const [busy, setBusy] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [editing, setEditing] = useState(false);
  const [typingId, setTypingId] = useState<string | null>(null);
  const [pop, setPop] = useState<Pop | null>(null);
  const [lensBox, setLensBox] = useState({ x: 0, w: 0 });
  const [tabBox, setTabBox] = useState({ x: 0, w: 0 });
  const lensRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const current = convos.find((c) => c.id === currentId) ?? convos[0];
  const person = current ? people[current.person] : undefined;
  const youN = convos.filter((c) => c.need).length;
  const keeN = convos.filter((c) => c.owner === 'kee' && !c.need).length;
  const rows = convos.filter((c) => (lens === 'all' ? true : lens === 'you' ? !!c.need : c.owner === 'kee' && !c.need));

  useEffect(() => { setInboxCount(youN); }, [youN, setInboxCount]);

  useLayoutEffect(() => {
    const root = lensRef.current;
    const b = root?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!root || !b) return;
    setLensBox({ x: b.offsetLeft, w: b.offsetWidth });
  }, [lens, youN, keeN]);

  useLayoutEffect(() => {
    const root = tabsRef.current;
    const b = root?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (!root || !b) return;
    setTabBox({ x: b.offsetLeft + 8, w: Math.max(0, b.offsetWidth - 16) });
  }, [currentId, current?.owner, person?.id]);

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [currentId, current?.msgs.length, typingId]);

  useEffect(() => {
    if (!pop) return;
    const close = (e: PointerEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest('[data-pop]')) return;
      setPop(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', onKey); };
  }, [pop]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      await sleep(9000);
      if (cancel) return;
      setTypingId('visitor-web');
      await sleep(1600);
      if (cancel) return;
      setTypingId(null);
      setConvos((list) => list.map((c) => c.id === 'visitor-web' ? { ...c, at: 'now', msgs: [...c.msgs, { id: mid(), k: 'in', text: "mostly reminders. we lose a lot of people who don't show up", at: 'now' }] } : c));
      await sleep(1500);
      if (cancel) return;
      setConvos((list) => list.map((c) => c.id === 'visitor-web' ? {
        ...c, at: 'now',
        msgs: [...c.msgs, { id: mid(), k: 'kee', text: "That's the most common one. Clinics like yours usually cut no-shows by about a third with two reminders and an easy reschedule link. Want me to show you how it works?", at: 'now', st: 'Seen' }],
      } : c));
    })();
    return () => { cancel = true; };
  }, []);

  if (!current || !person) return null;
  const sibs = convos.filter((c) => c.person === current.person);

  async function takeOver(c: Conversation) {
    setBusy(true);
    await sleep(450);
    const prev = c.owner;
    const text = prev === 'kee'
      ? '<b>You took over</b> · Kee is paused here until you hand it back'
      : `<b>You took over from ${ownerLabel({ ...c, owner: prev })}</b>`;
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, owner: 'me', need: null, msgs: [...x.msgs, { id: mid(), k: 'act', icon: 'hand', text }] } : x));
    setBusy(false);
    replyRef.current?.focus();
  }

  async function handBack(c: Conversation) {
    setBusy(true);
    await sleep(450);
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, owner: 'kee', need: null, msgs: [...x.msgs, { id: mid(), k: 'act', icon: 'arrow', text: '<b>You handed this back to Kee</b> · Kee replies to her next message' }] } : x));
    setBusy(false);
    showToast('Kee is replying again');
  }

  async function sendReply(c: Conversation) {
    const text = draftText.trim();
    if (!text) return;
    const id = mid();
    setDraftText('');
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, at: 'now', msgs: [...x.msgs, { id, k: 'me' as const, text, at: 'now', st: 'Sending' as const }] } : x));
    await sleep(800);
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, msgs: x.msgs.map((m) => m.id === id && m.k === 'me' ? { ...m, st: 'Delivered' } : m) } : x));
    if (c.id === 'maya-wa' && !c.replied) {
      setConvos((list) => list.map((x) => x.id === c.id ? { ...x, replied: true } : x));
      await sleep(2600);
      setTypingId(c.id);
      await sleep(1600);
      setTypingId(null);
      setConvos((list) => list.map((x) => x.id === c.id ? { ...x, at: 'now', msgs: [...x.msgs, { id: mid(), k: 'in', text: 'Perfect, thank you! Thursday afternoon works best for a call.', at: 'now' }] } : x));
    }
  }

  function place(anchor: HTMLElement, kind: Pop['kind'], which?: 'booking' | 'verify'): Pop {
    const r = anchor.getBoundingClientRect();
    const left = Math.min(Math.max(12, r.left), window.innerWidth - 320 - 12);
    if (kind === 'pick') return { kind, left, top: r.bottom + 8 };
    return { kind: 'link', which: which ?? 'booking', left, bottom: window.innerHeight - r.top + 8 };
  }

  async function sendLink(c: Conversation, which: 'booking' | 'verify') {
    setPop(null);
    const id = mid();
    const label = which === 'booking' ? 'booking' : 'verification';
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, msgs: [...x.msgs, { id, k: 'act', icon: 'link', text: `Sending ${label} link by email…` }] } : x));
    await sleep(900);
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, msgs: x.msgs.map((m) => m.id === id ? { ...m, text: `<b>${which === 'booking' ? 'Booking' : 'Verification'} link sent</b> by email · just now · ${which === 'booking' ? 'not booked yet' : 'not verified yet'}` } : m) } : x));
    const who = people[c.person];
    showToast(`${which === 'booking' ? 'Booking' : 'Verification'} link sent to ${who ? firstName(who.name) : 'them'}`);
  }

  function pickPerson(name: string) {
    const face = name.startsWith('Samantha') ? 'rita' : 'sam';
    setPeople((all) => {
      const sam = all.sam;
      if (!sam) return all;
      return {
        ...all,
        sam: {
          ...sam,
          name, initials: 'SO', face, conflict: false,
          org: name.startsWith('Samantha') ? 'Patient · Dallas' : 'Lead · Austin',
          handles: [['Email', 'sam@okafor.co', 'Linked by you']],
        },
      };
    });
    setConvos((list) => list.map((x) => x.id === 'sam-web' ? { ...x, conflict: false, need: null, msgs: [...x.msgs, { id: mid(), k: 'act', icon: 'check', text: `<b>You linked this chat to ${name}</b> · Kee can now see their history` }] } : x));
    setPop(null);
    showToast(`Linked to ${name}`);
  }

  async function checkDelivery(c: Conversation) {
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, msgs: x.msgs.map((m) => m.k === 'kee' && m.st === 'unknown' ? { ...m, st: 'checking' } : m) } : x));
    await sleep(1100);
    setConvos((list) => list.map((x) => x.id === c.id ? { ...x, need: null, msgs: x.msgs.map((m) => m.k === 'kee' && m.st === 'checking' ? { ...m, st: 'Delivered at 4:12 pm · no need to resend' } : m) } : x));
  }

  function resolveDraft(c: Conversation, how: 'send' | 'discard', text: string) {
    setEditing(false);
    setConvos((list) => list.map((x) => {
      if (x.id !== c.id) return x;
      const msgs = x.msgs.flatMap((m): Msg[] => {
        if (m.k !== 'draft') return [m];
        if (how === 'discard') return [{ id: mid(), k: 'act', text: "You discarded Kee's draft · Kee will wait for her next message" }];
        return [{ id: mid(), k: 'kee', text, at: 'now', st: 'Sending', approved: true }];
      });
      return { ...x, need: null, at: 'now', msgs };
    }));
    if (how === 'send') {
      void (async () => {
        await sleep(900);
        setConvos((list) => list.map((x) => x.id === c.id ? { ...x, msgs: x.msgs.map((m) => m.k === 'kee' && m.st === 'Sending' ? { ...m, st: 'Delivered' } : m) } : x));
        showToast('Sent to Priya on WhatsApp');
      })();
    }
  }

  return (
    <main
      className={cx(canvas, 'grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1 text-body max-[979px]:grid-cols-1 min-[980px]:max-[1319px]:grid-cols-[320px_minmax(0,1fr)] min-[1320px]:grid-cols-[336px_minmax(0,1fr)_320px]')}
      style={theme === 'light' ? inboxLight : undefined}
    >
      <div className="col-span-full"><AppBar /></div>

      <section aria-label="Conversations" className="row-start-2 grid min-h-0 grid-rows-[52px_auto_minmax(0,1fr)] border-r border-line max-[979px]:hidden">
        <div className="flex items-center px-[22px]"><h1 className="text-[13px] font-medium">Conversations</h1></div>
        <div ref={lensRef} className="relative flex gap-0.5 px-3.5 pb-2.5">
          <motion.span className="absolute top-0 left-0 h-[26px] rounded-md bg-sel" animate={{ x: lensBox.x, width: lensBox.w }} transition={ease(240)} />
          <LensButton pressed={lens === 'you'} onClick={() => setLens('you')}>Needs you <span className="text-caption text-ink-3 tabular-nums">{youN}</span></LensButton>
          <LensButton pressed={lens === 'kee'} onClick={() => setLens('kee')}>Kee is replying <span className="text-caption text-ink-3 tabular-nums">{keeN}</span></LensButton>
          <LensButton pressed={lens === 'all'} onClick={() => setLens('all')}>All</LensButton>
        </div>
        <div className="min-h-0 overflow-y-auto px-3 pb-4 [scrollbar-width:thin]">
          {rows.length === 0 ? <p className="px-2.5 py-4 text-[12.5px] text-ink-3">Nothing here right now.</p> : rows.map((c) => {
            const p = people[c.person];
            if (!p) return null;
            return (
              <button key={c.id} type="button" aria-current={c.id === currentId ? 'true' : undefined} onClick={() => { setCurrentId(c.id); setEditing(false); setDraftText(''); }} className="grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-0.5 rounded-lg px-2.5 py-[9px] text-left text-ink-2 hover:bg-hover aria-[current=true]:bg-sel">
                <PersonFace person={p} channel={c.ch} />
                <span className="truncate text-[13px] font-medium text-ink">{p.name}</span>
                <span className="text-caption text-ink-3 tabular-nums">{c.at}</span>
                {c.need ? <span className="col-span-2 col-start-2 flex items-center gap-1.5 text-meta leading-[18px] text-ink-2"><i className="size-[5px] shrink-0 rounded-full bg-accent" />{c.need}</span> : null}
                <span className="col-span-2 col-start-2 truncate text-[12.5px] leading-[18px] text-ink-3">{preview(c)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Conversation" className="row-start-2 grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto]">
        <div className="flex h-[60px] items-center gap-3 pr-5 pl-7">
          <PersonFace person={person} size="md" />
          <div className="min-w-0"><b className="block text-body leading-[18px] font-medium">{person.name}</b><span className="block truncate text-meta leading-4 text-ink-3">{person.org}</span></div>
          <span className="flex-1" />
          <OwnerBar owner={current.owner} busy={busy} onTake={() => void takeOver(current)} onBack={() => void handBack(current)} />
        </div>
        <div ref={tabsRef} className="relative flex gap-0.5 border-b border-line px-[18px]">
          {sibs.map((x) => (
            <button key={x.id} type="button" aria-selected={x.id === currentId} onClick={() => setCurrentId(x.id)} className="relative inline-flex h-[34px] items-center gap-[7px] px-2.5 text-[12.5px] text-ink-3 hover:text-ink aria-selected:text-ink">
              <ChMark ch={x.ch} size={12} />
              {CHANNEL[x.ch]}
              <span className="text-caption text-ink-3">· {ownerLabel(x)}</span>
            </button>
          ))}
          <motion.span className="absolute -bottom-px h-[1.5px] rounded-sm bg-ink" animate={{ x: tabBox.x, width: tabBox.w }} transition={ease(240)} />
        </div>
        <div ref={msgsRef} className="min-h-0 overflow-y-auto px-8 pt-6 pb-7">
          {current.conflict ? (
            <div className="mx-auto mb-3 grid w-[calc(100%-8px)] max-w-[720px] animate-rise gap-2 rounded-lg border border-line-2 bg-surface px-3 py-2.5 text-[13px] text-ink-2">
              <div><b className="text-ink">This email matches two people.</b> Kee is only using this chat until someone picks the right one — it won't look at either person's history.</div>
              <div><button type="button" data-pop className={btn} onClick={(e) => setPop(place(e.currentTarget, 'pick'))}>Pick the right person</button></div>
            </div>
          ) : null}
          <div className="mx-auto grid max-w-[720px] gap-3.5">
            {current.msgs.map((m) => (
              <Message key={m.id} msg={m} person={person} editing={editing} onEdit={() => setEditing(true)} onDraft={(how, text) => resolveDraft(current, how, text)} onCheck={() => void checkDelivery(current)} />
            ))}
            {typingId === current.id ? (
              <div className="inline-flex w-fit gap-1 rounded-xl rounded-tl border border-edge bg-surface px-3.5 py-3">
                <i className="size-[5px] animate-breathe rounded-full bg-ink-3" />
                <i className="size-[5px] animate-breathe rounded-full bg-ink-3 [animation-delay:150ms]" />
                <i className="size-[5px] animate-breathe rounded-full bg-ink-3 [animation-delay:300ms]" />
              </div>
            ) : null}
          </div>
        </div>
        <div className="px-8 pb-5">
          <div className="mx-auto max-w-[720px]">
            {current.owner === 'me' ? (
              <div className="rounded-[14px] border border-edge bg-surface shadow-lift focus-within:border-accent-line">
                <div className="flex flex-wrap items-center gap-1.5 px-3 pt-[9px] text-meta text-ink-3">
                  <span>Reply on</span><b className="font-medium text-ink-2">{CHANNEL[current.ch]}</b>
                  <span className="text-ink-4">·</span><span>to</span><b className="font-medium text-ink-2">{current.ch === 'email' ? person.email : current.ch === 'whatsapp' ? person.phone : person.name}</b>
                  <span className="text-ink-4">·</span><span>from</span><b className="font-medium text-ink-2">{current.from}</b>
                </div>
                <textarea ref={replyRef} rows={1} value={draftText} placeholder={`Write to ${firstName(person.name)}…`} onChange={(e) => { setDraftText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendReply(current); } }} className="block max-h-[180px] min-h-[30px] w-full resize-none bg-transparent px-3 pt-1.5 pb-1 leading-[22px] text-ink caret-accent outline-none placeholder:text-ink-3" />
                <div className="flex items-center gap-1 px-2 pt-1 pb-2">
                  <button type="button" data-pop onClick={(e) => setPop(place(e.currentTarget, 'link', 'booking'))} className="inline-flex h-[26px] items-center gap-1.5 rounded-md px-2 text-meta text-ink-3 hover:bg-hover hover:text-ink"><IconCal size={12} />Send booking link</button>
                  <button type="button" data-pop onClick={(e) => setPop(place(e.currentTarget, 'link', 'verify'))} className="inline-flex h-[26px] items-center gap-1.5 rounded-md px-2 text-meta text-ink-3 hover:bg-hover hover:text-ink"><IconShield size={12} />Send verification link</button>
                  <span className="flex-1" />
                  <button type="button" aria-label="Send" onClick={() => void sendReply(current)} className={cx('grid size-[26px] place-items-center rounded-full bg-send-off text-bg', draftText.trim() && 'bg-accent text-on-accent active:scale-95')}><IconArrowUp size={12} /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-[14px] border border-edge bg-surface py-3 pr-3 pl-3.5 text-[13px] text-ink-2">
                <span>{current.owner === 'kee' ? 'Kee is replying in this chat.' : `${STAFF.jess.name} is replying in this chat.`} Take over to write yourself.</span>
                <span className="flex-1" />
                <button type="button" className={btn} disabled={busy} onClick={() => void takeOver(current)}>Take over</button>
              </div>
            )}
            <div className="flex gap-3.5 px-1 pt-[7px] text-caption text-ink-3">
              {current.owner === 'me' ? <span>Enter to send · Shift + Enter for a new line</span> : <span>Kee asks you before anything unusual — discounts, refunds, or medical questions.</span>}
              {current.owner === 'me' ? <span>She's in quiet hours after 9 pm</span> : null}
            </div>
          </div>
        </div>
      </section>

      <aside aria-label="About this person" className="row-start-2 hidden min-h-0 content-start gap-6 overflow-y-auto border-l border-line px-6 pt-[22px] pb-7 [scrollbar-width:thin] min-[1320px]:grid">
        <Context person={person} others={sibs.filter((x) => x.id !== current.id)} onOpen={setCurrentId} />
      </aside>

      {pop?.kind === 'pick' ? (
        <div data-pop className="fixed z-[45] grid w-80 gap-2.5 rounded-[10px] bg-pal p-3 text-[13px] shadow-pop" style={{ left: pop.left, top: pop.top }}>
          <div className="font-medium">Who is sam@okafor.co?</div>
          <PickRow name="Sam Okafor" face="sam" initials="SO" detail="Lead · Austin · last seen 3 Oct" onPick={() => pickPerson('Sam Okafor')} />
          <PickRow name="Samantha Okafor" face="rita" initials="SO" detail="Patient · Dallas · booked 12 Oct" onPick={() => pickPerson('Samantha Okafor')} />
          <p className="text-meta text-ink-3">Only pick if you're sure. Kee will then see that person's history.</p>
        </div>
      ) : null}
      {pop?.kind === 'link' ? (
        <div data-pop className="fixed z-[45] grid w-80 gap-2.5 rounded-[10px] bg-pal p-3 text-[13px] shadow-pop" style={{ left: pop.left, bottom: pop.bottom }}>
          <div className="font-medium">{pop.which === 'booking' ? 'Send booking link' : 'Send verification link'}</div>
          <dl className="m-0 grid grid-cols-[52px_minmax(0,1fr)] gap-x-2.5 gap-y-1 text-[12.5px]">
            <dt className="text-ink-3">To</dt><dd className="m-0 truncate">{person.name} · {person.email}</dd>
            <dt className="text-ink-3">Via</dt><dd className="m-0">Email</dd>
            <dt className="text-ink-3">From</dt><dd className="m-0">nithin@keemakr.ai</dd>
          </dl>
          <p className="text-meta text-ink-3">{pop.which === 'booking' ? "Sending the link doesn't book her. The demo counts once Google Calendar confirms it." : "She's verified only after she opens the link and confirms. Clicking alone doesn't count."}</p>
          <div className="flex justify-end gap-1.5">
            <button type="button" className={btnPlain} onClick={() => setPop(null)}>Cancel</button>
            <button type="button" className={btnPri} onClick={() => void sendLink(current, pop.which)}>Send link</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function LensButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={cx('relative inline-flex h-[26px] items-center gap-1.5 rounded-md px-[9px] text-[12.5px] active:scale-[0.97]', pressed ? 'text-ink' : 'text-ink-3 hover:text-ink')}>
      {children}
    </button>
  );
}

function ChMark({ ch, size }: { ch: Channel; size: number }) {
  if (ch === 'web') return <IconGlobe size={size} />;
  return <BrandLogo name={ch === 'email' ? 'gmail' : ch === 'instagram' ? 'instagram' : 'whatsapp'} size={size} />;
}

function PersonFace({ person, channel, size = 'md' }: { person: Person; channel?: Channel; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Avatar face={person.face} initials={person.initials} anon={person.anon} size={size} badge={channel ? <ChMark ch={channel} size={9} /> : undefined} />
  );
}

function ActIconView({ icon }: { icon?: ActIcon }) {
  if (icon === 'hand') return <IconHand size={12} />;
  if (icon === 'cal') return <IconCal size={12} />;
  if (icon === 'link') return <IconLink size={12} />;
  if (icon === 'check') return <IconCheck size={12} />;
  return <IconArrowRight size={12} />;
}

function OwnerBar({ owner, busy, onTake, onBack }: { owner: Owner; busy: boolean; onTake: () => void; onBack: () => void }) {
  const you = owner === 'me';
  const kee = owner === 'kee';
  return (
    <div className={cx('flex items-center gap-2 text-[12.5px] text-ink-3', busy && '[&_.own]:opacity-60 [&_.own]:blur-[2px]')}>
      <i className={cx('size-1.5 rounded-full', you ? 'bg-ok' : kee ? 'animate-breathe bg-accent' : 'bg-ink-4')} />
      <span className="own">{you ? "You're replying · Kee is paused" : kee ? 'Kee is replying' : `${STAFF.jess.name} is replying`}</span>
      {you ? <button type="button" className={btn} disabled={busy} onClick={onBack}>Hand back to Kee</button> : <button type="button" className={btn} disabled={busy} onClick={onTake}>Take over</button>}
    </div>
  );
}

function Message({ msg, person, editing, onEdit, onDraft, onCheck }: {
  msg: Msg;
  person: Person;
  editing: boolean;
  onEdit: () => void;
  onDraft: (how: 'send' | 'discard', text: string) => void;
  onCheck: () => void;
}) {
  if (msg.k === 'day') return <div className="my-0.5 text-center text-caption text-ink-3">{msg.text}</div>;
  if (msg.k === 'act') {
    return (
      <div className={cx('flex max-w-[90%] items-center justify-self-center gap-2 text-center text-meta', msg.hand ? 'text-ink-2' : 'text-ink-3')}>
        <ActIconView icon={msg.icon} />
        <span><Markup text={msg.text} /></span>
      </div>
    );
  }
  if (msg.k === 'draft') {
    return <Draft msg={msg} editing={editing} onEdit={onEdit} onDraft={onDraft} />;
  }
  const incoming = msg.k === 'in';
  const staff = msg.k === 'staff';
  const who = incoming ? (person.anon ? 'Visitor' : person.conflict ? person.name : firstName(person.name)) : msg.k === 'kee' ? 'Kee' : msg.k === 'me' ? 'You' : STAFF.jess.name;
  return (
    <div className={cx('grid max-w-[78%] gap-1', incoming ? 'justify-self-start' : 'justify-self-end')}>
      <div className={cx('flex items-center gap-1.5 text-meta text-ink-3', !incoming && 'justify-end')}>
        {incoming ? <Avatar face={person.face} initials={person.anon ? '?' : person.initials} size="sm" anon={person.anon} /> : null}
        {msg.k === 'kee' ? <KeeMark size="md" /> : null}
        {msg.k === 'me' ? <span className="grid size-[18px] place-items-center rounded-full bg-surface-2 text-[9px] font-medium text-ink-2">NS</span> : null}
        {staff ? <Avatar face="jess" initials="JP" size="sm" /> : null}
        <b className="font-medium text-ink-2">{who}</b>
        {msg.k === 'kee' ? <span>· {msg.approved ? 'approved by you' : 'sent automatically'}</span> : null}
        <span>{msg.at}</span>
      </div>
      <div className={cx('rounded-xl px-[13px] py-[9px] whitespace-pre-wrap text-ink', incoming && 'rounded-tl border border-edge bg-surface', msg.k === 'me' && 'rounded-tr bg-surface-2', staff && 'rounded-tr border border-line-2 bg-transparent', msg.k === 'kee' && 'rounded-tr bg-surface-2')}>{msg.text}</div>
      {msg.k !== 'in' && msg.st ? (
        <div className={cx('flex items-center gap-1.5 text-caption text-ink-3', !incoming && 'justify-end', msg.st === 'unknown' && 'text-ink-2')}>
          {msg.st === 'unknown' ? <>WhatsApp hasn't confirmed this · <button type="button" className="text-ink underline decoration-line-2 underline-offset-[3px]" onClick={onCheck}>Check before resending</button></> : msg.st === 'checking' ? 'Checking with WhatsApp…' : msg.st === 'Sending' ? 'Sending…' : msg.st}
        </div>
      ) : null}
    </div>
  );
}

function Draft({ msg, editing, onEdit, onDraft }: { msg: Extract<Msg, { k: 'draft' }>; editing: boolean; onEdit: () => void; onDraft: (how: 'send' | 'discard', text: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="grid max-w-[78%] justify-self-end gap-2 rounded-xl border border-dashed border-line-2 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-meta text-ink-3"><KeeMark size="md" /><b className="font-medium text-ink-2">Kee's draft</b><span>· not sent</span></div>
      <div ref={ref} contentEditable={editing} suppressContentEditableWarning className={cx('whitespace-pre-wrap text-ink outline-none', editing && '-mx-1 -my-0.5 rounded-md bg-surface px-2 py-1.5 shadow-[0_0_0_1px_var(--line-2)]')}>{msg.text}</div>
      <p className="text-[12.5px] text-ink-2">{msg.why}</p>
      <div className="flex justify-end gap-1.5">
        <button type="button" className={btnPlain} onClick={() => onDraft('discard', '')}>Discard</button>
        {editing ? null : <button type="button" className={btn} onClick={onEdit}>Edit</button>}
        <button type="button" className={btnPri} onClick={() => onDraft('send', (editing ? ref.current?.textContent : msg.text)?.trim() || msg.text)}>{editing ? 'Send' : 'Send as is'}</button>
      </div>
    </div>
  );
}

function Context({ person, others, onOpen }: { person: Person; others: Conversation[]; onOpen: (id: string) => void }) {
  if (person.anon) {
    return (
      <>
        <div className="grid gap-2.5">
          <div className="flex items-center gap-2.5"><Avatar initials="?" anon size="lg" /><div><b className="block text-body leading-[18px]">Website visitor</b><span className="block text-meta text-ink-3">{person.org}</span></div></div>
          <p className="text-[12.5px] leading-[19px] text-ink-3">No contact yet. They haven't shared an email or phone, so Kee only sees this chat. You can still reply if you take over.</p>
        </div>
        <div>
          <h3 className="mb-2 text-caption font-medium tracking-[0.02em] text-ink-3">This visit</h3>
          <Kv rows={[['Arrived from', 'Google · "ai front desk"'], ['Pages', 'Pricing, Dental'], ['Chat', 'Website chat · keemakr.ai']]} />
        </div>
      </>
    );
  }
  if (person.conflict) {
    return (
      <div className="grid gap-2.5">
        <div className="flex items-center gap-2.5"><Avatar initials={person.initials} size="lg" /><div><b className="block text-body">{person.name}</b><span className="block text-meta text-ink-3">Not linked to anyone yet</span></div></div>
        <Kv rows={(person.handles ?? []).map(([k, v, s]) => [k, `${v}${s ? `\n${s}` : ''}`])} />
        <p className="text-[12.5px] leading-[19px] text-ink-3">Kee won't use either person's history until someone on the team picks the right one.</p>
      </div>
    );
  }
  return (
    <>
      <div className="grid gap-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar face={person.face} initials={person.initials} size="lg" />
          <div><b className="block text-body leading-[18px]">{person.name}</b><span className="block text-meta text-ink-3">{person.org}</span></div>
        </div>
        <dl className="grid grid-cols-[84px_minmax(0,1fr)] gap-x-2.5 gap-y-1.5 text-[12.5px] leading-[18px]">
          {(person.handles ?? []).map(([k, v, s]) => (
            <div key={k} className="contents"><dt className="text-ink-3">{k}</dt><dd className="m-0 break-words">{v}{s ? <><br /><span className={s === 'Verified' || s === 'Linked by you' ? 'text-ok' : 'text-ink-3'}>{s}</span></> : null}</dd></div>
          ))}
        </dl>
      </div>
      {person.journey ? (
        <div>
          <h3 className="mb-2 text-caption font-medium tracking-[0.02em] text-ink-3">Where she is</h3>
          <div>
            {person.journey.map(([label, state, when], i, all) => (
              <div key={label} className="relative grid grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-2.5 py-[5px] text-[12.5px] leading-[18px]">
                {i < all.length - 1 ? <span className="absolute top-[21px] bottom-[-5px] left-[7.5px] w-px bg-line-2" /> : null}
                <span className={cx('relative z-[1] grid size-4 place-items-center rounded-full border-[1.5px] border-line-2 bg-bg', state === 'done' && 'border-ink-3 bg-ink-3 text-bg', state === 'now' && 'border-accent')}>
                  {state === 'done' ? <IconCheck size={9} /> : null}
                  {state === 'now' ? <i className="size-1.5 rounded-full bg-accent" /> : null}
                </span>
                <span className={state === 'todo' ? 'text-ink-3' : 'text-ink'}>{label}</span>
                <span className="text-caption text-ink-3">{when}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {person.lead ? <div><h3 className="mb-2 text-caption font-medium tracking-[0.02em] text-ink-3">Lead · Sales</h3><Kv rows={person.lead} /></div> : null}
      {person.rules ? <div><h3 className="mb-2 text-caption font-medium tracking-[0.02em] text-ink-3">Contact rules</h3><Kv rows={person.rules} /></div> : null}
      {others.length ? (
        <div>
          <h3 className="mb-2 text-caption font-medium tracking-[0.02em] text-ink-3">Other conversations</h3>
          <div className="grid gap-0.5">
            {others.map((x) => (
              <button key={x.id} type="button" onClick={() => onOpen(x.id)} className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-ink-2 hover:bg-hover hover:text-ink">
                <ChMark ch={x.ch} size={12} />
                <span>{CHANNEL[x.ch]}</span>
                <span className="flex-1" />
                <span className="text-caption text-ink-3">{ownerLabel(x)} · {x.at}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Kv({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid grid-cols-[84px_minmax(0,1fr)] gap-x-2.5 gap-y-1.5 text-[12.5px] leading-[18px]">
      {rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-ink-3">{k}</dt><dd className="m-0 whitespace-pre-wrap break-words">{v}</dd></div>)}
    </dl>
  );
}

function PickRow({ name, face, initials, detail, onPick }: { name: string; face: 'sam' | 'rita'; initials: string; detail: string; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="flex w-full items-center gap-2.5 rounded-[7px] border border-line-2 p-2 text-left text-ink-2 hover:border-ink-4 hover:text-ink active:scale-[0.98]">
      <Avatar face={face} initials={initials} size="sm" />
      <span>{name}<small className="block text-meta text-ink-3">{detail}</small></span>
    </button>
  );
}
