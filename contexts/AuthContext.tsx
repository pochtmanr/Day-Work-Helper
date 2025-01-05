'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  FacebookAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { initializeDatabase, verifyDatabaseSetup } from '@/lib/firebase/init-database'
import { useToast } from "@/components/ui/use-toast"
import { getDoc, updateDoc, doc } from 'firebase/firestore'

interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  tag: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithFacebook: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (name: string) => Promise<void>
  updateUserTag: (tag: string) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email)
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const userData = userDoc.data()
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          tag: userData?.tag || null
        })
        
        try {
          console.log('Initializing database...')
          await initializeDatabase(firebaseUser)
          const verified = await verifyDatabaseSetup(firebaseUser)
          if (!verified) {
            console.error('Database verification failed')
            toast({
              title: "Database Error",
              description: "There was an error setting up the database. Please try logging out and back in.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error('Error initializing database:', error)
          toast({
            title: "Database Error",
            description: "Failed to initialize database. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...')
      const result = await signInWithEmailAndPassword(auth, email, password)
      await initializeDatabase(result.user)
      console.log('Login successful')
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      console.log('Attempting registration...')
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await initializeDatabase(result.user)
      console.log('Registration successful')
    } catch (error: any) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const loginWithFacebook = async () => {
    try {
      console.log('Attempting Facebook login...')
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
    
      if (user && (user.displayName || user.photoURL)) {
        await updateProfile(user, {
          displayName: user.displayName || null,
          photoURL: user.photoURL || null
        })
      }
      await initializeDatabase(user)
      console.log('Facebook login successful')
      router.push('/dashboard/chat-templates')
    } catch (error: any) {
      console.error('Facebook login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error('Logout error:', error)
      throw new Error(error.message)
    }
  }

  const updateUserProfile = async (name: string) => {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        await updateProfile(currentUser, { displayName: name })
        setUser(prev => prev ? { ...prev, displayName: name } : null)
      } else {
        throw new Error('No user is currently logged in')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      throw new Error(error.message)
    }
  }

  const updateUserTag = async (tag: string) => {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), { tag })
        setUser(prev => prev ? { ...prev, tag } : null)
      } else {
        throw new Error('No user is currently logged in')
      }
    } catch (error: any) {
      console.error('Update tag error:', error)
      throw new Error(error.message)
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const currentUser = auth.currentUser
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, oldPassword)
        await reauthenticateWithCredential(currentUser, credential)
        await updatePassword(currentUser, newPassword)
      } else {
        throw new Error('No user is currently logged in')
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      throw new Error(error.message)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithFacebook, logout, updateUserProfile, updateUserTag, changePassword, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

