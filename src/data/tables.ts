export type ColType = 'text' | 'email' | 'enum' | 'number' | 'date' | 'url';
export type Column = { key: string; label: string; type: ColType };
export type Row = { id: string; kee?: boolean; [key: string]: string | boolean | undefined };

export type Table = {
  id: string;
  name: string;
  group: string;
  about: string;
  updated: string;
  count: number;
  columns: Column[];
  rows: Row[];
  /** The enum column the Pipeline view groups by. */
  stages?: { key: string; order: string[] };
};

export const TABLES: Table[] = [
  {
    id: 'leads',
    name: 'Leads',
    group: 'Sales',
    about: 'People Kee found, qualified, or heard back from',
    updated: '2 min ago',
    count: 214,
    stages: { key: 'status', order: ['Qualified', 'Contacted', 'In conversation', 'Booked'] },
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'tier', label: 'Tier', type: 'enum' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'touch', label: 'Last touch', type: 'date' },
    ],
    rows: [
      { id: 'maya', name: 'Dr. Maya Ellison', company: 'Glow Aesthetics', email: 'maya@glowatx.com', tier: 'A', status: 'Booked', touch: 'Today' },
      { id: 'priya', name: 'Priya Shah', company: 'Lumen Skin Studio', email: 'priya@lumenskin.co', tier: 'A', status: 'In conversation', touch: 'Today', kee: true },
      { id: 'chris', name: 'Chris Patel', company: 'Barton Creek MedSpa', email: 'chris@bartoncreekmed.com', tier: 'B', status: 'Booked', touch: 'Yesterday' },
      { id: 'jordan', name: 'Jordan Lee', company: 'Peak Dental Group', email: 'jordan@peakdental.com', tier: 'B', status: 'Contacted', touch: '3d ago' },
      { id: 'sam', name: 'Sam Okafor', company: 'Riverside Smiles', email: 'sam@riversidesmiles.com', tier: 'C', status: 'Qualified', touch: '5d ago' },
      { id: 'lena', name: 'Lena Fischer', company: 'Mile High Dental', email: 'lena@milehighdental.com', tier: 'B', status: 'Contacted', touch: '1w ago' },
      { id: 'omar', name: 'Omar Haddad', company: 'Cedar Park Skin', email: 'omar@cedarparkskin.com', tier: 'A', status: 'Qualified', touch: '1w ago' },
      { id: 'kim', name: 'Kim Nguyen', company: 'Southside Laser', email: 'kim@southsidelaser.com', tier: 'B', status: 'In conversation', touch: '1w ago' },
    ],
  },
  {
    id: 'companies',
    name: 'Companies',
    group: 'Sales',
    about: 'Businesses behind your leads',
    updated: '1 h ago',
    count: 128,
    columns: [
      { key: 'name', label: 'Company', type: 'text' },
      { key: 'site', label: 'Website', type: 'url' },
      { key: 'city', label: 'Location', type: 'text' },
      { key: 'size', label: 'Size', type: 'number' },
      { key: 'source', label: 'Source', type: 'enum' },
    ],
    rows: [
      { id: 'glow', name: 'Glow Aesthetics', site: 'glowatx.com', city: 'Austin, TX', size: '2', source: 'Exa' },
      { id: 'lumen', name: 'Lumen Skin Studio', site: 'lumenskin.co', city: 'Austin, TX', size: '1', source: 'Exa' },
      { id: 'barton', name: 'Barton Creek MedSpa', site: 'bartoncreekmed.com', city: 'Austin, TX', size: '3', source: 'Exa' },
      { id: 'peak', name: 'Peak Dental Group', site: 'peakdental.com', city: 'Denver, CO', size: '5', source: 'Exa' },
      { id: 'riverside', name: 'Riverside Smiles', site: 'riversidesmiles.com', city: 'Denver, CO', size: '1', source: 'Import' },
    ],
  },
  {
    id: 'runs',
    name: 'Pipeline runs',
    group: 'Sales',
    about: 'Every run Kee started to find and reach people',
    updated: 'now',
    count: 6,
    columns: [
      { key: 'name', label: 'Run', type: 'text' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'found', label: 'Found', type: 'number' },
      { key: 'sent', label: 'Sent', type: 'number' },
      { key: 'started', label: 'Started', type: 'date' },
    ],
    rows: [
      { id: 'austin', name: 'Austin clinics outreach', status: 'Needs you', found: '20', sent: '0', started: 'Today' },
      { id: 'denver', name: 'Denver dental groups', status: 'Running', found: '34', sent: '0', started: 'Today', kee: true },
      { id: 'webinar', name: 'Webinar leads follow-up', status: 'Done', found: '61', sent: '58', started: '3d ago' },
      { id: 'seed', name: 'Seed founders hiring design', status: 'Done', found: '40', sent: '38', started: '1w ago' },
    ],
  },
  {
    id: 'drafts',
    name: 'Outreach drafts',
    group: 'Sales',
    about: 'Emails Kee wrote and is holding for your approval',
    updated: '12 min ago',
    count: 20,
    columns: [
      { key: 'to', label: 'To', type: 'text' },
      { key: 'subject', label: 'Subject', type: 'text' },
      { key: 'run', label: 'Run', type: 'text' },
      { key: 'state', label: 'State', type: 'enum' },
    ],
    rows: [
      { id: 'd1', to: 'Dr. Maya Ellison', subject: 'A quieter front desk at Glow', run: 'Austin clinics outreach', state: 'Waiting' },
      { id: 'd2', to: 'Priya Shah', subject: 'Re-booking Lumen clients automatically', run: 'Austin clinics outreach', state: 'Waiting' },
      { id: 'd3', to: 'Chris Patel', subject: 'Three locations, one inbox', run: 'Austin clinics outreach', state: 'Waiting' },
    ],
  },
  {
    id: 'vendors',
    name: 'Vendors',
    group: 'Workspace',
    about: 'Suppliers and the contracts you keep with them',
    updated: '2d ago',
    count: 14,
    columns: [
      { key: 'name', label: 'Vendor', type: 'text' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'renews', label: 'Renews', type: 'date' },
    ],
    rows: [
      { id: 'v1', name: 'Gusto', owner: 'Clara Vance', renews: 'Jan 2027' },
      { id: 'v2', name: 'Google Workspace', owner: 'Clara Vance', renews: 'Mar 2027' },
    ],
  },
];

export const tableById = (id: string) => TABLES.find((t) => t.id === id);
