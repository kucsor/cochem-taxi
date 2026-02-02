import { permanentRedirect } from 'next/navigation'
import { i18n } from '@/i18n-config'

export default function RootPage() {
  permanentRedirect(i18n.defaultLocale)
}
