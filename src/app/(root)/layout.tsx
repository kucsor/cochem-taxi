import { SiteDocument } from '@/components/site-document';
export { metadata, viewport } from '@/components/site-document';
export default function RootLayout({children}: {children:React.ReactNode}) {return <SiteDocument lang="de">{children}</SiteDocument>;}
