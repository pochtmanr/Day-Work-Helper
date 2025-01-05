'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from './icons/Logo'

const navItems = [
  { href: '/dashboard/chat-templates', label: 'chatTemplates' },
  { href: '/dashboard/email-templates', label: 'emailTemplates' },
  { href: '/dashboard/case-resolutions', label: 'caseResolutions' },
  { href: '/dashboard/profile', label: 'profile' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="w-64 bg-white shadow-md">
      <div className="p-4">
        <div className="flex items-center space-x-2 mt-2">
          <Logo />
          <h1 className="text-2xl font-bold">{t('TemplateWorks')}</h1>
        </div>
      </div>
      <ul className="space-y-2 p-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-md hover:bg-gray-100",
                pathname === item.href && "bg-gray-100 font-semibold"
              )}
            >
              {t(item.label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

