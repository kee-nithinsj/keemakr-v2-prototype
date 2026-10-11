import type { Brand } from '@/components/ui/BrandLogo';

export type ConnectionStatus = 'connected' | 'attention' | 'available';

export type Connection = {
  id: string;
  name: string;
  /** Providers without a logo in the icon set show their initial instead. */
  brand?: Brand;
  scope: 'you' | 'workspace';
  category: string;
  about: string;
  status: ConnectionStatus;
  account?: string;
  since?: string;
  can?: string;
  problem?: string;
  usedBy?: string[];
};

export const CONNECTIONS: Connection[] = [
  { id: 'gmail', name: 'Gmail', brand: 'gmail', scope: 'you', category: 'Email', about: 'Send outreach and read replies', status: 'connected', account: 'clara@larkline.co', since: '3 Oct', can: 'Send email, read replies, create drafts', usedBy: ['Sales'] },
  { id: 'gcal', name: 'Google Calendar', brand: 'gcal', scope: 'you', category: 'Calendar', about: 'See your meetings and book calls', status: 'connected', account: 'clara@larkline.co', since: '3 Oct', can: 'Read events, create events', usedBy: ['Sales'] },
  { id: 'outlook', name: 'Outlook', scope: 'you', category: 'Email', about: 'Mail and calendar from Microsoft 365', status: 'available' },
  { id: 'whatsapp', name: 'WhatsApp Business', brand: 'whatsapp', scope: 'workspace', category: 'Messaging', about: 'Reply to customers on WhatsApp', status: 'connected', account: '+1 512 555 0100', since: '28 Sep', can: 'Receive and send messages', usedBy: ['Sales'] },
  { id: 'instagram', name: 'Instagram', brand: 'instagram', scope: 'workspace', category: 'Messaging', about: 'Answer direct messages', status: 'attention', account: '@larkline', problem: 'Access expired 2 days ago. Reconnect so Kee can answer DMs.' },
  { id: 'slack', name: 'Slack', scope: 'workspace', category: 'Messaging', about: "Get Kee's updates in a channel", status: 'available' },
  { id: 'hubspot', name: 'HubSpot', brand: 'hubspot', scope: 'workspace', category: 'CRM', about: 'Sync contacts and deals', status: 'available' },
  { id: 'gdrive', name: 'Google Drive', brand: 'gdrive', scope: 'workspace', category: 'Files', about: 'Let Kee read shared docs', status: 'available' },
  { id: 'notion', name: 'Notion', brand: 'notion', scope: 'workspace', category: 'Files', about: 'Let Kee read your wiki', status: 'available' },
  { id: 'stripe', name: 'Stripe', brand: 'stripe', scope: 'workspace', category: 'Payments', about: 'See payments and invoices', status: 'available' },
  { id: 'shopify', name: 'Shopify', brand: 'shopify', scope: 'workspace', category: 'Commerce', about: 'Orders and customers', status: 'available' },
];
