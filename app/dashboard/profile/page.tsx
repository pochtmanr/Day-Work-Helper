'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateProfile, deleteUser, sendPasswordResetEmail, updatePassword, Auth } from 'firebase/auth'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import supabase from '@/lib/supabase'
import { User } from 'firebase/auth'

const userTags = ['SupportPro', 'Meta Verified', 'Jedi', 'Admin', 'SME', 'Junior']

export default function Profile() {
  const { user, logout, updateUserProfile, updateUserTag } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoURL, setPhotoURL] = useState('')
  const [tag, setTag] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhotoURL(user.photoURL || '')
      setTag(user.tag || '')
    } else {
      router.push('/login')
    }
  }, [user, router])

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      await updateUserProfile(name)
      toast({
        title: t('Name Updated'),
        description: t('Your name has been updated successfully.'),
      })
    } catch (error) {
      console.error('Error updating name:', error)
      toast({
        title: t('Update Failed'),
        description: t('Failed to update your name. Please try again.'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!file || !user) return

    setIsLoading(true)
    try {
      const filePath = `user-photos/${user.uid}/${file.name}`
      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      console.log(publicUrl)

      await updateProfile(user as unknown as User, { photoURL: publicUrl })
      setPhotoURL(publicUrl)
      toast({
        title: t('Photo Updated'),
        description: t('Your profile photo has been updated successfully.'),
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        title: "Error",
        description: t("Failed to upload your photo. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagChange = async (value: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: t("You must be logged in to update your tag."),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await updateUserTag(value)
      setTag(value)
      toast({
        title: "Success",
        description: t("Your user tag has been updated successfully."),
      })
    } catch (error) {
      console.error('Error updating tag:', error)
      toast({
        title: "Error",
        description: t("Failed to update your tag. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: t("You must be logged in to change your password."),
        variant: "destructive",
      })
      return

    }

    setIsLoading(true)
    try {
      await updatePassword(user as unknown as User, newPassword)
      toast({
        title: "Success",
        description: t("Your password has been changed successfully."),
      })
      setOldPassword('')
      setNewPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: t("Failed to change your password. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user || !user.email) {
      toast({
        title: "Error",
        description: t("You must be logged in to reset your password."),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await sendPasswordResetEmail(user as unknown as Auth, user.email)
      toast({
        title: "Success",
        description: t("Check your email for instructions to reset your password."),
      })
    } catch (error) {
      console.error('Error sending password reset email:', error)
      toast({
        title: "Error",
        description: t("Failed to send password reset email. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: t("You must be logged in to delete your account."),
        variant: "destructive",
      })
      return
    }

    const confirmDelete = window.confirm(t("Are you sure you want to delete your account? This action cannot be undone."))
    if (!confirmDelete) return

    setIsLoading(true)
    try {
      await deleteUser(user as unknown as User)
      toast({
        title: "Success",
        description: t("Your account has been deleted successfully."),
      })
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: t("Failed to delete your account. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = (value: 'en' | 'he') => {
    setLanguage(value)
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateUserProfile(name);
      toast({
        title: t('Settings Saved'),
        description: t('Your settings have been saved successfully.'),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t('Save Failed'),
        description: t('Failed to save your settings. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('Profile Settings')}</h1>
        <form onSubmit={saveSettings} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('Name')}</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="language">{t('Language')}</Label>
            <Select onValueChange={handleLanguageChange} value={language}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('Select a language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('English')}</SelectItem>
                <SelectItem value="he">{t('Hebrew')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </form>
        <div className="mt-4">
          <Label htmlFor="tag">{t('User Tag')}</Label>
          <Select onValueChange={handleTagChange} value={tag}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('Select a tag')} />
            </SelectTrigger>
            <SelectContent>
              {userTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {t('Save Settings')}
            </Button>
          </div>
        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <Label htmlFor="oldPassword">{t('Old Password')}</Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">{t('New Password')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('Changing...') : t('changePassword')}
          </Button>
        </form>
        <div className="mt-6 space-y-4">
          <Button
            onClick={handlePasswordReset}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {t('Reset Password')}
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="w-full"
            disabled={isLoading}
          >
            {t('Delete Account')}
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full"
          >
            {t('Logout')}
          </Button>
        </div>
        <div className="mt-4 text-center">
          <Link href="/about" className="text-blue-600 hover:underline">
            {t('About TemplateWorks')}
          </Link>
        </div>
      </div>
    </div>
  )
}

