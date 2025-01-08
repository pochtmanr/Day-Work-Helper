import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
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
    const userResolutionsQuery = query(
      collection(db, caseResolutionsCollection),
      where('userId', '==', user.uid),
      orderBy('isPrivate', 'asc'),
      orderBy('createdAt', 'desc'),
      orderBy('__name__', 'desc')
    );

    const publicResolutionsQuery = query(
      collection(db, caseResolutionsCollection),
      where('isPrivate', '==', false),
      orderBy('createdAt', 'desc'),
      orderBy('__name__', 'desc')
    );

    const [userDocs, publicDocs] = await Promise.all([
      getDocs(userResolutionsQuery),
      getDocs(publicResolutionsQuery)
    ]);

    const allDocs = [...userDocs.docs, ...publicDocs.docs];
    
    return allDocs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as CaseResolution[];
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