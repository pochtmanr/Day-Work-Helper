import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

export interface CaseReply {
  id: string
  resolutionId: string
  userId: string
  content: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export const caseRepliesCollection = 'caseReplies'

export async function createCaseReply(
  user: User | null,
  reply: Omit<CaseReply, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<CaseReply> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const docRef = await addDoc(collection(db, caseRepliesCollection), {
      ...reply,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      ...reply,
      id: docRef.id,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to create replies')
    }
    throw error
  }
}

export async function getCaseReplies(
  user: User | null,
  resolutionId: string
): Promise<CaseReply[]> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const q = query(
      collection(db, caseRepliesCollection),
      where('resolutionId', '==', resolutionId),
      orderBy('createdAt', 'asc')
    )

    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as CaseReply[]
  } catch (error) {
    console.error('Error getting replies:', error)
    throw error
  }
}

export async function updateCaseReply(
  user: User | null,
  id: string,
  reply: Partial<Omit<CaseReply, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const docRef = doc(db, caseRepliesCollection, id)
    await updateDoc(docRef, {
      ...reply,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to update this reply')
    }
    throw error
  }
}

export async function deleteCaseReply(user: User | null, id: string): Promise<void> {
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const docRef = doc(db, caseRepliesCollection, id)
    await deleteDoc(docRef)
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to delete this reply')
    }
    throw error
  }
}

