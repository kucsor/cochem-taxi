'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { i18n, type Locale } from '@/i18n-config'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react'
import { trackEvent } from '@/lib/tracking'

export function LanguageSwitcher({ currentLang }: { currentLang?: string }) {
  const pathName = usePathname()
  const currentLocale = (currentLang || pathName.split('/')[1] || i18n.defaultLocale) as Locale

  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    const slug = segments[2];
    if (['preise', 'prices', 'prijzen'].includes(slug)) segments[2] = {de:'preise',en:'prices',nl:'prijzen'}[locale];
    if (['aktivitaeten', 'things-to-do', 'bezienswaardigheden'].includes(slug)) segments[2] = {de:'aktivitaeten',en:'things-to-do',nl:'bezienswaardigheden'}[locale];
    return segments.join('/')
  }
  
  const languageNames: Record<Locale, string> = {
    de: 'Deutsch',
    en: 'English',
    nl: 'Nederlands',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Globe className="mr-2 h-4 w-4" />
          {languageNames[currentLocale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem key={locale} asChild>
            <Link 
              href={redirectedPathName(locale)}
              onClick={() => {
                if (locale !== currentLocale) {
                  trackEvent('change_language', { language: locale });
                }
              }}
            >
              {languageNames[locale]}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
