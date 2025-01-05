'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Logo } from '@/components/icons/Logo'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FileIcon, MailIcon, MessageSquareIcon } from 'lucide-react'

export default function LandingPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()

  if (user) {
    router.push('/dashboard/chat-templates')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Logo />
            <span className="text-2xl font-bold text-gray-900">{t('TemplateWorks')}</span>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/login" className="text-gray-600 hover:text-gray-900">{t('login')}</Link></li>
              <li><Link href="/register" className="text-gray-600 hover:text-gray-900">{t('register')}</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">{t('About')}</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
          {t('Streamline Your Workflow')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('Create, manage, and organize your templates effortlessly with TemplateWorks.')}
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild size="lg">
            <Link href="/register">{t('Get Started')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">{t('Log In')}</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MessageSquareIcon />}
            title={t('Chat Templates')}
            description={t('Create and manage chat templates for quick responses.')}
          />
          <FeatureCard
            icon={<MailIcon />}
            title={t('Email Templates')}
            description={t('Design professional email templates for various scenarios.')}
          />
          <FeatureCard
            icon={<FileIcon />}
            title={t('Case Resolutions')}
            description={t('Document and share case resolution steps for efficient problem-solving.')}
          />
        </div>
      </main>

      <footer className="bg-gray-100 py-8 mt-16 fixed bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 TemplateWorks. {t('All rights reserved.')}</p>
          <Link href="/about" className="text-blue-600 hover:underline mt-2 inline-block">
            {t('About Us')}
          </Link>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-indigo-600 mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

