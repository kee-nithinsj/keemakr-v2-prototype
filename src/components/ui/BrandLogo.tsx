import {
  SiDropbox,
  SiGmail,
  SiGooglecalendar,
  SiGoogledrive,
  SiHubspot,
  SiInstagram,
  SiNotion,
  SiShopify,
  SiStripe,
  SiWhatsapp,
} from '@icons-pack/react-simple-icons';

const ICONS = {
  whatsapp: SiWhatsapp,
  gmail: SiGmail,
  instagram: SiInstagram,
  gcal: SiGooglecalendar,
  gdrive: SiGoogledrive,
  hubspot: SiHubspot,
  notion: SiNotion,
  stripe: SiStripe,
  shopify: SiShopify,
  dropbox: SiDropbox,
};

export type Brand = keyof typeof ICONS;

/** `mono` inherits the surrounding text colour, for places where a logo is a quiet label. */
export function BrandLogo({ name, size = 14, mono }: { name: Brand; size?: number; mono?: boolean }) {
  const Icon = ICONS[name];
  return <Icon size={size} color={mono ? 'currentColor' : 'default'} title="" aria-hidden="true" />;
}
