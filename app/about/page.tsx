'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from '@/components/icons/Logo'
import Link from 'next/link'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <Logo />
          <h1 className="mt-6 text-4xl font-bold text-gray-900">{t('About TemplateWorks')}</h1>
        </div>
        
        <div className="prose prose-lg mx-auto">
          <p>{t('TemplateWorks is a powerful tool designed to streamline your workflow and boost productivity.')}</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-12">{t('Key Features :')}</h2>
          <ul>
            <li>{t('• Customizable chat templates')}</li>
            <li>{t('• Professional email templates')}</li>
            <li>{t('• Efficient case resolution management')}</li>
          </ul>
          
          
          
          
          <div className="fixed bottom-0 left-0 right-0 bg-white text-center py-4 shadow">
            <p className="text-sm text-gray-600">{t('© 2025 TemplateWorks. All rights reserved.')}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              {t('Return to Home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

