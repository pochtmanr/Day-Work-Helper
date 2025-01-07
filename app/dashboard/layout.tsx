'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from '@/components/icons/Logo'

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!user) {
    return null // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl mt-2">
              {t(currentTime.toLocaleString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' }))}
            </h1>
          </div>
          <Button onClick={() => {
            logout()
            router.push('/login')
          }}>
            {t('logout')}
          </Button>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>
}

