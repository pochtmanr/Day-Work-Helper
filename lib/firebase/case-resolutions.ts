import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

export interface ResolutionStep {
  id?: string
  content: string
  images: string[]
  links: {
    url: string
    description?: string
    image?: string
  }[]
}

export interface CaseResolution {
  id: string
  userId: string
  title: string
  description: string
  steps: ResolutionStep[]
  tags: string[]
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export const caseResolutionsCollection = 'caseResolutions'

export async function createCaseResolution(
  user: User | null,
  resolution: Omit<CaseResolution, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<CaseResolution> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
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

export async function getCaseResolutions(user: User): Promise<CaseResolution[]> {
  if (!user) throw new Error('User must be logged in to fetch case resolutions')

  try {
    // Query for all case resolutions, ordered by creation date
    const allResolutionsQuery = query(
      collection(db, caseResolutionsCollection),
      orderBy('createdAt', 'desc')
    );

    const allDocs = await getDocs(allResolutionsQuery);
    
    return allDocs.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        // Ensure steps and links have default values if not present
        steps: data.steps || [],
        tags: data.tags || [],
      } as CaseResolution;
    });
  } catch (error: any) {
    console.error('Error getting case resolutions:', error);
    throw new Error('Failed to fetch case resolutions: ' + (error.message || 'Unknown error'));
  }
}

export async function updateCaseResolution(
  user: User | null,
  id: string,
  resolution: Partial<Omit<CaseResolution, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const docRef = doc(db, caseResolutionsCollection, id)
    const docSnapshot = await getDoc(docRef)
    if (!docSnapshot.exists() || docSnapshot.data().userId !== user.uid) {
      throw new Error('You do not have permission to edit this resolution')
    }

    await updateDoc(docRef, {
      ...resolution,
      updatedAt: new Date()
    })
    console.log('Resolution updated successfully')
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
    console.log('Resolution deleted successfully')
  } catch (error: any) {
    console.error('Error deleting case resolution:', error)
    throw new Error('Failed to delete case resolution: ' + (error.message || 'Unknown error'))
  }
}