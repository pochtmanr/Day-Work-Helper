import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

export interface ChatTemplate {
  id: string
  userId: string
  name: string
  contentMale: string
  contentFemale: string
  tags: string[]
  language: 'en' | 'he'
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

const chatTemplatesCollection = 'chatTemplates'

export async function createChatTemplate(
  user: User,
  template: Omit<ChatTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<ChatTemplate> {
  if (!user) throw new Error('User must be logged in to create a template')

  const docRef = await addDoc(collection(db, chatTemplatesCollection), {
    ...template,
    userId: user.uid,
    isPrivate: template.isPrivate ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return {
    ...template,
    id: docRef.id,
    userId: user.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function getChatTemplates(user: User): Promise<ChatTemplate[]> {
  if (!user) throw new Error('User must be logged in to fetch templates')

  try {
    // Query for user's own templates
    const userTemplatesQuery = query(
      collection(db, chatTemplatesCollection),
      where('userId', '==', user.uid),
      orderBy('isPrivate', 'asc'),
      orderBy('createdAt', 'desc')
    );

    // Query for public templates
    const publicTemplatesQuery = query(
      collection(db, chatTemplatesCollection),
      where('isPrivate', '==', false),
      orderBy('userId', 'asc'),
      orderBy('createdAt', 'desc')
    );

    // Execute both queries
    const [userDocs, publicDocs] = await Promise.all([
      getDocs(userTemplatesQuery),
      getDocs(publicTemplatesQuery)
    ]);

    // Combine results
    const allDocs = [...userDocs.docs, ...publicDocs.docs];
    
    return allDocs
      .filter(doc => doc.id !== 'placeholder')
      .map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as ChatTemplate[];
  } catch (error: any) {
    console.error('Error getting chat templates:', error);
    throw new Error('Failed to fetch chat templates: ' + (error.message || 'Unknown error'));
  }
}

export async function updateChatTemplate(
  user: User,
  id: string,
  template: Partial<Omit<ChatTemplate, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  if (!user) throw new Error('User must be logged in to update a template')

  const docRef = doc(db, chatTemplatesCollection, id)
  await updateDoc(docRef, {
    ...template,
    updatedAt: new Date(),
  })
}

export async function deleteChatTemplate(user: User, id: string): Promise<void> {
  if (!user) throw new Error('User must be logged in to delete a template')

  const docRef = doc(db, chatTemplatesCollection, id)
  await deleteDoc(docRef)
}

