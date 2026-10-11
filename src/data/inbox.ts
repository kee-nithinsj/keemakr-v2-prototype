import type { Contact, Conversation } from './types';

export type Person = Contact & { id: string };

export const PEOPLE: Record<string, Person> = {
  maya: {
    id: 'maya', name: 'Dr. Maya Ellison', initials: 'ME', org: 'Lumen Aesthetics · San Diego', face: 'maya',
    handles: [['Email', 'maya@lumenaesthetics.com', 'Verified'], ['Phone', '+1 619 555 0142', 'Verified']],
    journey: [['Enquired', 'done', '2 Oct'], ['Verified', 'done', '3 Oct'], ['Demo booked', 'now', 'Waiting on her'], ['Signed', 'todo', '']],
    lead: [['Source', 'Med spa intro · email'], ['Score', '86'], ['Owner', 'Clara Vance']],
    rules: [['Contact', 'Allowed · replied 2 Oct'], ['Quiet hours', '9 pm – 8 am her time'], ['Stops if', 'She asks us to stop']],
    email: 'maya@lumenaesthetics.com', phone: '+1 619 555 0142',
  },
  priya: {
    id: 'priya', name: 'Priya Natarajan', initials: 'PN', org: 'Glow House Med Spa · Irvine', face: 'priya',
    handles: [['Email', 'priya@glowhouse.co', 'Verified'], ['Phone', '+1 949 555 0177', 'Not verified']],
    journey: [['Enquired', 'done', '28 Sep'], ['Verified', 'done', '29 Sep'], ['Proposal sent', 'now', '9 Oct'], ['Signed', 'todo', '']],
    lead: [['Source', 'Website chat'], ['Score', '81'], ['Owner', 'Clara Vance']],
    rules: [['Contact', 'Allowed · asked for a quote'], ['Quiet hours', '9 pm – 8 am her time'], ['Stops if', 'She asks us to stop']],
    email: 'priya@glowhouse.co', phone: '+1 949 555 0177',
  },
  visitor: { id: 'visitor', name: 'Website visitor', initials: '?', anon: true, org: 'Austin, TX · first visit today' },
  sam: {
    id: 'sam', name: 'sam@okafor.co', initials: 'S', org: 'Website chat · email given, not matched yet', conflict: true,
    handles: [['Email', 'sam@okafor.co', 'Matches 2 people']],
  },
  ana: {
    id: 'ana', name: 'Ana Lima', initials: 'AL', org: 'Bloom Skin Studio · Austin', face: 'ana',
    handles: [['Phone', '+1 512 555 0108', 'Verified']],
    journey: [['Enquired', 'done', '6 Oct'], ['Verified', 'done', '6 Oct'], ['Demo booked', 'done', 'Thu 14:30'], ['Signed', 'todo', '']],
    lead: [['Source', 'Instagram'], ['Score', '77'], ['Owner', 'Clara Vance']],
    rules: [['Contact', 'Allowed · booked a demo'], ['Quiet hours', '9 pm – 8 am her time'], ['Stops if', 'She asks us to stop']],
    email: 'ana@bloomskin.studio', phone: '+1 512 555 0108',
  },
  jordan: {
    id: 'jordan', name: 'Jordan Reyes', initials: 'JR', org: 'Coastline Dermatology · Santa Monica', face: 'jordan',
    handles: [['Email', 'jordan@coastlinederm.com', 'Verified']],
    journey: [['Enquired', 'done', '1 Oct'], ['Verified', 'done', '1 Oct'], ['Contract', 'now', 'With Jess'], ['Signed', 'todo', '']],
    lead: [['Source', 'Referral'], ['Score', '74'], ['Owner', 'Jess Park']],
    rules: [['Contact', 'Allowed'], ['Quiet hours', '9 pm – 8 am his time'], ['Stops if', 'He asks us to stop']],
    email: 'jordan@coastlinederm.com',
  },
  chris: {
    id: 'chris', name: 'Chris Patel', initials: 'CP', org: 'Radiance Med Spa · Dallas', face: 'chris',
    handles: [['Instagram', '@radiance.dallas', '']],
    journey: [['Enquired', 'now', 'Today'], ['Verified', 'todo', ''], ['Demo booked', 'todo', ''], ['Signed', 'todo', '']],
    lead: [['Source', 'Instagram'], ['Score', '—'], ['Owner', 'Not assigned']],
    rules: [['Contact', 'Allowed · messaged us first'], ['Quiet hours', '9 pm – 8 am his time'], ['Stops if', 'He asks us to stop']],
  },
  dana: {
    id: 'dana', name: 'Dana Wu', initials: 'DW', org: 'Aura Aesthetics · Phoenix', face: 'dana',
    handles: [['Email', 'dana@aura.clinic', 'Verified']],
    journey: [['Enquired', 'done', '5 Oct'], ['Verified', 'done', '5 Oct'], ['Demo booked', 'done', 'Fri 11:00'], ['Signed', 'todo', '']],
    lead: [['Source', 'Med spa intro · email'], ['Score', '69'], ['Owner', 'Clara Vance']],
    rules: [['Contact', 'Allowed'], ['Quiet hours', '9 pm – 8 am her time'], ['Stops if', 'She asks us to stop']],
  },
};

export const CONVOS: Conversation[] = [
  { id: 'maya-wa', person: 'maya', ch: 'whatsapp', from: 'Kee Sales · +1 512 555 0100', owner: 'me', need: 'Kee handed this to you · asked for a person', at: '7:02 pm', msgs: [
    { id: 'm1', k: 'act', icon: 'arrow', text: 'Started from outreach · <b>Med spa intro</b> email, 2 Oct' },
    { id: 'm2', k: 'day', text: 'Today' },
    { id: 'm3', k: 'in', text: 'Hi — got your email. Does this work for a 3-room clinic?', at: '6:58 pm' },
    { id: 'm4', k: 'kee', text: 'It does. Most 3-room clinics start with the front-desk agent and add reminders after the first month. Happy to show you how it would look for Lumen.', at: '6:59 pm', st: 'Delivered' },
    { id: 'm5', k: 'in', text: 'Interesting. What would it cost for us? And can I talk to someone?', at: '7:02 pm' },
    { id: 'm6', k: 'act', icon: 'hand', hand: true, text: '<b>Kee handed this to you</b> · She asked for a person and for pricing. Kee is paused here.' },
  ] },
  { id: 'maya-em', person: 'maya', ch: 'email', from: 'clara@larkline.co', owner: 'kee', need: null, at: '2 Oct', msgs: [
    { id: 'e1', k: 'act', icon: 'arrow', text: 'Outreach email <b>Med spa intro</b> · sent 2 Oct, opened twice' },
    { id: 'e2', k: 'in', text: "Thanks Clara — I'll message you on WhatsApp, easier for me.", at: '2 Oct' },
    { id: 'e3', k: 'kee', text: "Perfect — I'll keep an eye out for you there.", at: '2 Oct', st: 'Delivered' },
  ] },
  { id: 'priya-wa', person: 'priya', ch: 'whatsapp', from: 'Kee Sales · +1 512 555 0100', owner: 'kee', need: 'Kee wants you to check a reply', at: '6:41 pm', msgs: [
    { id: 'p1', k: 'day', text: 'Today' },
    { id: 'p2', k: 'in', text: 'We loved the proposal. Can you do 20% off if we sign this week?', at: '6:40 pm' },
    { id: 'p3', k: 'draft', text: "Thanks Priya — glad it landed well! I can do 10% if you sign by Friday, and I'll include onboarding for both locations at no cost.", why: 'Discounts above 10% need your OK. Kee offered 10% instead of the 20% she asked for.' },
  ] },
  { id: 'sam-web', person: 'sam', ch: 'web', from: 'Website chat · keemakr.ai', owner: 'kee', need: 'Two people match this email', at: '5:20 pm', conflict: true, msgs: [
    { id: 's1', k: 'day', text: 'Today' },
    { id: 's2', k: 'in', text: 'hey, checking on my booking for next week', at: '5:18 pm' },
    { id: 's3', k: 'kee', text: 'Happy to help. Could you share the email you booked with?', at: '5:18 pm', st: 'Seen' },
    { id: 's4', k: 'in', text: 'sam@okafor.co', at: '5:19 pm' },
    { id: 's5', k: 'kee', text: 'Thanks! Give me a moment while someone on the team confirms your details.', at: '5:20 pm', st: 'Seen' },
  ] },
  { id: 'ana-wa', person: 'ana', ch: 'whatsapp', from: 'Kee Sales · +1 512 555 0100', owner: 'kee', need: 'A message may not have gone out', at: '4:12 pm', msgs: [
    { id: 'a1', k: 'day', text: 'Today' },
    { id: 'a2', k: 'in', text: 'Can we move Thursday to 3 pm?', at: '4:10 pm' },
    { id: 'a3', k: 'act', icon: 'cal', text: '<b>Demo moved</b> to Thu 15:00 · confirmed by Google Calendar' },
    { id: 'a4', k: 'kee', text: "Done — you're on Thursday at 3 pm. The invite is updated.", at: '4:12 pm', st: 'unknown' },
  ] },
  { id: 'visitor-web', person: 'visitor', ch: 'web', from: 'Website chat · keemakr.ai', owner: 'kee', need: null, at: 'now', live: true, msgs: [
    { id: 'v1', k: 'day', text: 'Today' },
    { id: 'v2', k: 'in', text: 'do you work with dental clinics too?', at: '7:08 pm' },
    { id: 'v3', k: 'kee', text: 'We do — front desk, reminders and follow-ups work the same way for dental. What would you want help with first?', at: '7:08 pm', st: 'Seen' },
  ] },
  { id: 'chris-ig', person: 'chris', ch: 'instagram', from: 'Instagram · @keemakr', owner: 'kee', need: null, at: '6:55 pm', msgs: [
    { id: 'c1', k: 'day', text: 'Today' },
    { id: 'c2', k: 'in', text: 'saw your reel — is there a free trial?', at: '6:54 pm' },
    { id: 'c3', k: 'kee', text: "There's a 14-day trial with your real calendar connected. Want me to set it up?", at: '6:55 pm', st: 'Seen' },
  ] },
  { id: 'jordan-em', person: 'jordan', ch: 'email', from: 'jess@keemakr.ai', owner: 'jess', need: null, at: '3:30 pm', msgs: [
    { id: 'j1', k: 'day', text: 'Today' },
    { id: 'j2', k: 'in', text: 'Legal had two edits on section 4. Attached.', at: '2:51 pm' },
    { id: 'j3', k: 'act', icon: 'hand', text: '<b>Jess took over</b> · 2:58 pm' },
    { id: 'j4', k: 'staff', who: 'jess', text: 'Thanks Jordan — both edits are fine. Sending the updated contract shortly.', at: '3:30 pm', st: 'Delivered' },
  ] },
  { id: 'dana-em', person: 'dana', ch: 'email', from: 'clara@larkline.co', owner: 'kee', need: null, at: 'Yesterday', msgs: [
    { id: 'd1', k: 'in', text: 'Friday at 11 works.', at: 'Yesterday' },
    { id: 'd2', k: 'act', icon: 'cal', text: '<b>Demo booked</b> · Fri 11:00 · confirmed by Google Calendar' },
    { id: 'd3', k: 'kee', text: 'Booked — see you Friday at 11. The invite has the call link.', at: 'Yesterday', st: 'Delivered' },
  ] },
];

export const CHANNEL: Record<Conversation['ch'], string> = {
  whatsapp: 'WhatsApp', email: 'Email', web: 'Website chat', instagram: 'Instagram',
};

let n = 0;
export const mid = () => `x${++n}`;
