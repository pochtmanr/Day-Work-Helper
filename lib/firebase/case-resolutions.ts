import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

export interface ResolutionStep {
  id: string
  content: string
  images: string[]
  links: {
    url: string
    description: string
    image: string
  }[]
}

export interface CaseResolution {
  id: string
  userId: string
  title: string
  description: string
  reason: string
  descriptionImages: string[] | null
  steps: ResolutionStep[] | null
  tags: string[] | null
  isPublished: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export const caseResolutionsCollection = 'caseResolutions'

async function ensureCollectionExists() {
  const collectionRef = collection(db, caseResolutionsCollection)
  const snapshot = await getDocs(query(collectionRef, where('type', '==', 'placeholder')))
  
  if (snapshot.empty) {
    await setDoc(doc(collectionRef, 'placeholder'), {
      type: 'placeholder',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
}

export async function createCaseResolution(
  user: User | null,
  resolution: Omit<CaseResolution, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<CaseResolution> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    await ensureCollectionExists()
    
    const docRef = await addDoc(collection(db, caseResolutionsCollection), {
      ...resolution,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return {
      ...resolution,
      id: docRef.id,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  } catch (error: any) {
    console.error('Error creating case resolution:', error)
    throw new Error('Failed to create case resolution')
  }
}

export async function getCaseResolutions(user: User | null): Promise<CaseResolution[]> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    await ensureCollectionExists()
    
    const q = query(
      collection(db, caseResolutionsCollection),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs
      .filter(doc => doc.id !== 'placeholder')
      .map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as CaseResolution[]
  } catch (error: any) {
    console.error('Error getting case resolutions:', error)
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to access these resolutions')
    }
    throw new Error('Failed to fetch case resolutions: ' + (error.message || 'Unknown error'))
  }
}

export async function updateCaseResolution(
  user: User | null,
  id: string,
  resolution: Partial<Omit<CaseResolution, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const docRef = doc(db, caseResolutionsCollection, id)
    await updateDoc(docRef, {
      ...resolution,
      updatedAt: new Date()
    })
  } catch (error: any) {
    console.error('Error updating case resolution:', error)
    throw new Error('Failed to update case resolution: ' + (error.message || 'Unknown error'))
  }
}

export async function deleteCaseResolution(user: User | null, id: string): Promise<void> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const docRef = doc(db, caseResolutionsCollection, id)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting case resolution:', error)
    throw new Error('Failed to delete case resolution: ' + (error.message || 'Unknown error'))
  }
}

