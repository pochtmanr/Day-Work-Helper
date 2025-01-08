import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, setDoc, doc, writeBatch, getDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

interface ChatTemplate {
  userId: string  
  name: string
  contentMale: string
  contentFemale: string
  tags: string[]
  isPrivate: boolean
  language: 'en' | 'he'
}

interface EmailTemplate {
  userId: string
  name: string
  subject: string
  contentMale: string
  contentFemale: string
  tags: string[]
  isPrivate: boolean
  language: 'en' | 'he'
}

interface CaseResolution {
  userId: string
  title: string
  description: string
  language: 'en' | 'he'
  steps: {
    id: string
    content: string
    images: string[]
  }[]
  tags: string[]
}

// Helper function to ensure collection exists
async function ensureCollection(collectionName: string) {
  console.log(`Ensuring collection ${collectionName} exists...`)
  try {
    const collectionRef = collection(db, collectionName)
    const placeholderRef = doc(collectionRef, 'placeholder')
    const placeholderDoc = await getDoc(placeholderRef)
    
    if (!placeholderDoc.exists()) {
      console.log(`Creating placeholder for ${collectionName}...`)
      await setDoc(placeholderRef, {
        type: 'placeholder',
        createdAt: new Date(),
        isPrivate: false // Make placeholder documents public
      })
      console.log(`Created placeholder for ${collectionName}`)
    }
  } catch (error) {
    console.error(`Error ensuring collection ${collectionName}:`, error)
    // Don't throw the error, just log it
    console.warn(`Continuing despite error for ${collectionName}`)
  }
}

export async function initializeDatabase(user: User) {
  if (!user) {
    console.error('No user provided for database initialization')
    return
  }

  console.log('Starting database initialization for user:', user.uid)

  try {
    // First ensure all collections exist
    await Promise.all([
      ensureCollection('users'),
      ensureCollection('chatTemplates'),
      ensureCollection('emailTemplates'),
      ensureCollection('caseResolutions'),
      ensureCollection('caseReplies')
    ])

    // Create or update user document
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true })

    console.log('User document updated:', user.uid)

    // Initialize templates if they don't exist
    const batch = writeBatch(db)

    // Check and initialize chat templates
    const chatTemplatesQuery = query(
      collection(db, 'chatTemplates'),
      where('userId', '==', user.uid)
    )
    const chatTemplatesSnapshot = await getDocs(chatTemplatesQuery)

    if (chatTemplatesSnapshot.empty) {
      console.log('Initializing chat templates...')
      const chatTemplates: ChatTemplate[] = [
        {
          userId: user.uid,
          name: 'Welcome Message',
          contentMale: 'Hello Mr. {name}, how can I assist you today?',
          contentFemale: 'Hello Ms. {name}, how can I assist you today?',
          language: 'en',
          tags: ['greeting', 'welcome'],
          isPrivate: false
        }
      ]

      chatTemplates.forEach(template => {
        const docRef = doc(collection(db, 'chatTemplates'))
        batch.set(docRef, {
          ...template,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })
    }

    // Check and initialize email templates
    const emailTemplatesQuery = query(
      collection(db, 'emailTemplates'),
      where('userId', '==', user.uid)
    )
    const emailTemplatesSnapshot = await getDocs(emailTemplatesQuery)

    if (emailTemplatesSnapshot.empty) {
      console.log('Initializing email templates...')
      const emailTemplates: EmailTemplate[] = [
        {
          userId: user.uid,
          name: 'Issue Follow-up',
          subject: 'Following Up on Your Recent Issue',
          contentMale: 'Dear Mr. {name},\n\nI hope this email finds you well.',
          contentFemale: 'Dear Ms. {name},\n\nI hope this email finds you well.',
          language: 'en',
          tags: ['follow-up', 'support'],
          isPrivate: false
        }
      ]

      emailTemplates.forEach(template => {
        const docRef = doc(collection(db, 'emailTemplates'))
        batch.set(docRef, {
          ...template,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })
    }

    // Commit all the batch operations
    await batch.commit()
    console.log('Database initialization completed successfully')

  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

// Function to verify database setup
export async function verifyDatabaseSetup(user: User) {
  if (!user) return false

  try {
    console.log('Verifying database setup...')
    
    // Check all collections
    const collections = ['users', 'chatTemplates', 'emailTemplates', 'caseResolutions', 'caseReplies']
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName)
      const snapshot = await getDocs(collectionRef)
      console.log(`Collection ${collectionName} exists with ${snapshot.size} documents`)
    }

    // Verify user document
    const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)))
    console.log('User document exists:', !userDoc.empty)

    return true
  } catch (error) {
    console.error('Error verifying database setup:', error)
    return false
  }
}

