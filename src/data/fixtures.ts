import type { ChatSummary, Hap, Need, Question, Reminder } from './types';

export const CHATS: ChatSummary[] = [
  { id: 'austin', title: 'Austin clinics outreach', at: 'now', status: 'live' },
  { id: 'plan', title: 'Campaign plan for Friday', at: '2h', status: 'ask' },
  { id: 'acme', title: 'Acme call recap', at: '1d', status: 'idle' },
  { id: 'leads', title: 'Webinar leads import', at: '3d', status: 'idle' },
  { id: 'pricing', title: 'Pricing page questions', at: '5d', status: 'idle' },
  { id: 'hire', title: 'Founding engineer search', at: '1w', status: 'idle' },
  { id: 'q3', title: 'Q3 pipeline review', at: '2w', status: 'idle' },
];

export const NEEDS: Need[] = [
  {
    id: 'approve',
    icon: 'gmail',
    kind: 'Approval · Austin clinics outreach',
    title: 'Send 20 emails to Austin clinics',
    detail: 'From teodora@larkline.co through Gmail. This approval covers these 20 emails only.',
    actions: [
      { kind: 'approve', label: 'Approve and send', primary: true },
      { kind: 'link', label: 'Review drafts', to: '/chat/austin' },
    ],
  },
  {
    id: 'convos',
    icon: 'people',
    kind: 'Conversations',
    title: '4 conversations need you',
    detail: 'Maya asked for a person · Priya wants 20% off · 2 more',
    actions: [{ kind: 'link', label: 'Open', to: '/conversations' }],
  },
  {
    id: 'report',
    icon: 'report',
    kind: 'Review · Weekly pipeline',
    title: 'Your weekly pipeline report is ready',
    detail: 'Version 2 · only you can see it until you share it',
    actions: [{ kind: 'report', label: 'Open report' }],
  },
  {
    id: 'ig',
    icon: 'instagram',
    kind: 'Connection · Instagram',
    title: 'Reconnect Instagram so Kee can keep replying',
    detail: 'Instagram signed Kee out on Friday · 2 messages waiting',
    actions: [{ kind: 'reconnect', label: 'Reconnect' }],
  },
];

export const HAPS: Hap[] = [
  { id: 'h1', icon: 'table', lead: 'Found 20 Austin clinics', rest: 'with an owner and a working email', at: '5:40 pm' },
  { id: 'h2', icon: 'cal', lead: 'Booked a demo with Dana Wu', rest: 'for Friday at 11', at: '4:58 pm' },
  { id: 'h3', icon: 'chat', lead: 'Replied in 23 conversations', rest: 'and handed 1 to you', at: '4:30 pm', to: '/conversations' },
  { id: 'h4', icon: 'report', lead: 'Rebuilt the weekly pipeline report', rest: 'by clinic size', at: '3:12 pm' },
  { id: 'h5', icon: 'retry', lead: 'Imported 86 webinar leads', rest: 'after one retry · 12 had no email', at: '1:05 pm' },
  { id: 'h6', icon: 'mail', lead: 'Sent 14 follow-up emails', rest: '· 2 bounced', at: '11:20 am' },
  { id: 'h7', icon: 'cal', lead: "Moved Ana Lima's demo", rest: 'to Thursday at 3 pm', at: 'Yesterday' },
  { id: 'h8', icon: 'meet', lead: 'Sent the Acme call recap', rest: 'to Ammaar and Haard', at: 'Yesterday', to: '/chat/acme' },
];

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    source: 'Austin clinics outreach',
    to: '/chat/austin',
    text: 'Three clinics list two owners. Who should get the email?',
    options: ['The owner named first on their website', 'Both owners, in one email', 'Skip those three clinics'],
    recommended: 0,
  },
  {
    id: 'q2',
    source: 'Glow House proposal',
    to: '/conversations',
    text: 'Priya asked for 20% off. What can Kee offer her?',
    options: ['10% if she signs by Friday', '15% with a 12-month term', 'Match the 20% — I approve it'],
    recommended: 0,
  },
  {
    id: 'q3',
    source: 'Webinar leads import',
    text: '12 people have no email. What should Kee do with them?',
    options: ['Look up their work email', 'Add them without an email', 'Leave them out'],
    recommended: 0,
  },
];

export const REMINDERS: Reminder[] = [
  { id: 'r1', text: 'Send Priya the revised proposal', when: 'Today, 8 pm', soon: true, from: "from Priya's chat" },
  { id: 'r2', text: 'Ask Jordan for the signed contract', when: 'Tomorrow', from: 'from the Acme call' },
  { id: 'r3', text: "Prep pricing for 3-room clinics", when: 'Thursday', from: "before Ana's demo" },
  { id: 'r4', text: 'Share the weekly report with Jess', when: 'Friday' },
];

export const CLINICS: ReadonlyArray<readonly [string, string]> = [
  ['Zilker Family Clinic', '4.9 · 612'],
  ['Premier Dental Austin', '4.9 · 488'],
  ['South Congress Health', '4.8 · 931'],
  ['Rosewood Family Medicine', '4.8 · 377'],
  ['Oak Hill Medical', '4.8 · 402'],
  ['Barton Hills Pediatrics', '4.8 · 290'],
  ['Westlake Family Health', '4.7 · 744'],
  ['Mueller Clinic', '4.7 · 515'],
  ['Crestview Family Care', '4.7 · 268'],
  ['Tarrytown Health', '4.7 · 330'],
  ['East Side Medicine', '4.7 · 452'],
  ['Burnet Road Dental', '4.7 · 219'],
  ['Hyde Park Clinic', '4.6 · 384'],
  ['Bouldin Creek Health', '4.6 · 201'],
  ['Allandale Family', '4.6 · 257'],
  ['North Loop Medical', '4.6 · 318'],
  ['Travis Heights Dental', '4.6 · 190'],
  ['Clarksville Care', '4.6 · 233'],
  ['Windsor Park Clinic', '4.5 · 412'],
  ['Cherrywood Health', '4.5 · 176'],
];
