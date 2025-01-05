'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { FaFacebook } from "react-icons/fa"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from '@/contexts/LanguageContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { login, loginWithFacebook } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (!acceptedTerms) {
      toast({
        title: t("Terms of Service"),
        description: t("You must accept the Terms of Service to log in."),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      toast({
        title: t("Login Successful"),
        description: t("You have been logged in successfully."),
      })
      router.push('/dashboard/chat-templates')
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: t("Login Failed"),
        description: error?.message || t("Invalid email or password. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await loginWithFacebook()
      toast({
        title: t("Login Successful"),
        description: t("You have been logged in with Facebook successfully."),
      })
      router.push('/dashboard/chat-templates')
    } catch (error: any) {
      console.error('Facebook login error:', error)
      toast({
        title: t("Login Failed"),
        description: error.message || t("Failed to login with Facebook. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('login')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full"
              placeholder={t('Enter your email')}
            />
          </div>
          <div>
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full"
              placeholder={t('Enter your password')}
              minLength={6}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked: boolean) => setAcceptedTerms(checked)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600"
            >
              {t('I accept the')} <Link href="/terms" className="text-blue-600 hover:underline">{t('Terms of Service')}</Link>
            </label>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !acceptedTerms}
          >
            {isLoading ? t('Logging in...') : t('login')}
          </Button>
        </form>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleFacebookLogin}
            disabled={isLoading}
          >
            <FaFacebook className="mr-2" />
            {isLoading ? t('Processing...') : t('Login with Facebook')}
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          {t("Don't have an account?")}{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            {t('Register here')}
          </Link>
        </p>
      </div>
    </div>
  )
}

