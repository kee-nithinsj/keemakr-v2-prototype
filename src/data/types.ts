import type { FaceId } from '@/components/ui/Avatar';

/* ---------- home ---------- */
export type NeedAction =
  | { kind: 'approve' | 'reconnect' | 'report'; label: string; primary?: boolean }
  | { kind: 'link'; label: string; to: string; primary?: boolean };

export type Need = {
  id: string;
  icon: 'gmail' | 'instagram' | 'report' | 'people';
  kind: string;
  title: string;
  detail: string;
  actions: NeedAction[];
};

export type HapIcon = 'table' | 'cal' | 'chat' | 'report' | 'retry' | 'mail' | 'meet' | 'link';
export type Hap = { id: string; icon: HapIcon; lead: string; rest: string; at: string; to?: string };

export type Question = { id: string; source: string; to?: string; text: string; options: string[]; recommended: number };

export type Person = { face: FaceId; initials: string };
export type CalEvent = {
  id: string;
  /** Minutes since local midnight. */
  start: number;
  title: string;
  sub: string;
  meet?: string;
  kee?: boolean;
  person?: Person;
};

export type Reminder = { id: string; text: string; when: string; soon?: boolean; from?: string };

/* ---------- chats ---------- */
export type ChatStatus = 'live' | 'ask' | 'idle';
export type ChatSummary = { id: string; title: string; at: string; status: ChatStatus };

/* ---------- conversations ---------- */
export type Channel = 'whatsapp' | 'email' | 'web' | 'instagram';
export type Owner = 'kee' | 'me' | 'jess';
export type ActIcon = 'arrow' | 'hand' | 'cal' | 'link' | 'check';
export type Delivery = 'Delivered' | 'Seen' | 'Sending' | 'unknown' | 'checking' | (string & {});

export type Msg =
  | { id: string; k: 'day'; text: string }
  | { id: string; k: 'act'; icon?: ActIcon; hand?: boolean; lead?: string; text: string }
  | { id: string; k: 'in'; text: string; at: string }
  | { id: string; k: 'kee' | 'me'; text: string; at: string; st?: Delivery; approved?: boolean }
  | { id: string; k: 'staff'; who: 'jess'; text: string; at: string; st?: Delivery }
  | { id: string; k: 'draft'; text: string; why: string };

export type Contact = {
  name: string;
  initials: string;
  org: string;
  face?: FaceId;
  anon?: boolean;
  conflict?: boolean;
  handles?: Array<[label: string, value: string, status: string]>;
  journey?: Array<[label: string, state: 'done' | 'now' | 'todo', when: string]>;
  lead?: Array<[string, string]>;
  rules?: Array<[string, string]>;
  email?: string;
  phone?: string;
};

export type Conversation = {
  id: string;
  person: string;
  ch: Channel;
  from: string;
  owner: Owner;
  /** Why this needs a person, or null when Kee has it. */
  need: string | null;
  at: string;
  conflict?: boolean;
  live?: boolean;
  replied?: boolean;
  msgs: Msg[];
};
