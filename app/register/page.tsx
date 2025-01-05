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

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { register, loginWithFacebook } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        title: t("Validation Error"),
        description: t("Please enter your email."),
        variant: "destructive",
      })
      return false
    }
    if (password.length < 6) {
      toast({
        title: t("Validation Error"),
        description: t("Password must be at least 6 characters long."),
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    if (!validateForm()) return

    if (!acceptedTerms) {
      toast({
        title: t("Terms of Service"),
        description: t("You must accept the Terms of Service to register."),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await register(email, password)
      toast({
        title: t("Registration Successful"),
        description: t("Your account has been created successfully."),
      })
      router.push('/dashboard/chat-templates')
    } catch (error: any) {
      console.error('Registration error:', error)
      let errorMessage = t("Failed to create account. Please try again.")
    
      // Handle specific Firebase auth errors
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = t("This email is already registered. Please try logging in.")
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = t("Invalid email address. Please check and try again.")
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = t("Password is too weak. Please use a stronger password.")
      } else if (error?.code === 'permission-denied') {
        errorMessage = t("Permission denied. Please check your account permissions or try again later.")
      }
    
      toast({
        title: t("Registration Failed"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookRegister = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await loginWithFacebook()
      toast({
        title: t("Registration Successful"),
        description: t("Your account has been created with Facebook successfully."),
      })
      router.push('/dashboard/chat-templates')
    } catch (error: any) {
      console.error('Facebook registration error:', error)
      toast({
        title: t("Registration Failed"),
        description: error.message || t("Failed to register with Facebook. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('register')}</h2>
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
              placeholder={t('Enter your password (min. 6 characters)')}
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
            {isLoading ? t('Creating account...') : t('register')}
          </Button>
        </form>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleFacebookRegister}
            disabled={isLoading}
          >
            <FaFacebook className="mr-2" />
            {isLoading ? t('Processing...') : t('Register with Facebook')}
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          {t('Already have an account?')}{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            {t('Login here')}
          </Link>
        </p>
      </div>
    </div>
  )
}

