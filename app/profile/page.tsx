'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { deleteUser, updateProfile, User } from 'firebase/auth'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Image from 'next/image'

export default function Profile() {
  const { user, logout } = useAuth()
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoURL, setPhotoURL] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhotoURL(user.photoURL || '')
    }
  }, [user])

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      await updateProfile(user as unknown as User, { displayName: name })
      toast({
        title: "Name Updated",
        description: "Your name has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating name:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update your name. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsLoading(true)
    try {
      const storage = getStorage()
      const storageRef = ref(storage, `user-photos/${user.uid}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      await updateProfile(user as unknown as User, { photoURL: downloadURL })
      setPhotoURL(downloadURL)
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload your photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
    if (!confirmDelete) return

    setIsLoading(true)
    try {
      await deleteUser(user as unknown as User)
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      })
      router.push('/login')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile Settings</h1>
        <div className="mb-6 flex flex-col items-center">
          {photoURL ? (
            <Image
              src={photoURL}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
              No Photo
            </div>
          )}
          <Input
            type="file"
            onChange={handlePhotoUpload}
            accept="image/*"
            className="mt-2"
            disabled={isLoading}
          />
        </div>
        <form onSubmit={handleNameChange} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Name'}
          </Button>
        </form>
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="w-full"
            disabled={isLoading}
          >
            Delete Account
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

