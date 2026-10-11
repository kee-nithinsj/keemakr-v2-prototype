/* Pack screens in the @keemakr/ui-sdk shape: the pack sends a node tree, the client draws it.
   Screens show what rows can't: progress, flow and outcomes. Raw records live in Tables. */

export type Node =
  | { type: 'stats'; items: Array<{ label: string; value: string; note?: string }> }
  | { type: 'funnel'; title: string; steps: Array<{ label: string; value: number }> }
  | { type: 'progress'; title: string; items: Array<{ label: string; meta: string; done: number; total: number; to?: string }> }
  | { type: 'timeline'; title: string; items: Array<{ text: string; at: string }> }
  | { type: 'actions'; items: Array<{ id: string; label: string; primary?: boolean; to: string }> };

export type Screen = { title: string; sub?: string; nodes: Node[] };

export type Department = {
  slug: string;
  name: string;
  screens: Array<{ id: string; label: string }>;
  /** The pack's tables, shown under the department as shortcuts into Tables. */
  tables: Array<{ id: string; label: string }>;
};

/** Only departments whose pack the member is assigned to are listed; the rest are hidden. */
export const DEPARTMENTS: Department[] = [
  {
    slug: 'sales',
    name: 'Sales',
    screens: [{ id: 'overview', label: 'Overview' }],
    tables: [
      { id: 'leads', label: 'Leads' },
      { id: 'companies', label: 'Companies' },
      { id: 'runs', label: 'Pipeline runs' },
    ],
  },
];

export const SCREENS: Record<string, Screen> = {
  'sales/overview': {
    title: 'Sales',
    sub: 'What Kee is doing to fill your calendar this week.',
    nodes: [
      { type: 'actions', items: [{ id: 'run', label: 'Start a run', primary: true, to: '/chat/new' }, { id: 'leads', label: 'Open leads', to: '/tables/leads' }] },
      {
        type: 'stats',
        items: [
          { label: 'Calls booked', value: '3', note: '+2 vs last week' },
          { label: 'Replies', value: '11', note: '11.5% reply rate' },
          { label: 'Emails sent', value: '96' },
          { label: 'Spent', value: '$14.20', note: 'of $50 this month' },
        ],
      },
      {
        type: 'funnel',
        title: 'This month',
        steps: [
          { label: 'Found', value: 214 },
          { label: 'Qualified', value: 132 },
          { label: 'Contacted', value: 96 },
          { label: 'Replied', value: 11 },
          { label: 'Booked', value: 3 },
        ],
      },
      {
        type: 'progress',
        title: 'Running now',
        items: [
          { label: 'Denver dental groups', meta: 'Drafting emails', done: 12, total: 34, to: '/chat/austin' },
          { label: 'Austin clinics outreach', meta: 'Waiting for your approval', done: 20, total: 20, to: '/chat/austin' },
        ],
      },
      {
        type: 'timeline',
        title: 'Recent outcomes',
        items: [
          { text: 'Dr. Maya Ellison booked a call for Thursday, 2:30 pm', at: 'Today, 6:12 pm' },
          { text: 'Priya Shah asked about pricing for two locations', at: 'Today, 4:05 pm' },
          { text: 'Chris Patel booked a demo from Instagram', at: 'Yesterday' },
          { text: 'Webinar follow-up finished: 58 sent, 4 replies', at: '3 days ago' },
        ],
      },
    ],
  },
};
