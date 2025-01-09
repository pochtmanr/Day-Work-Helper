import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

export interface EmailTemplate {
  id: string
  userId: string
  name: string
  subject: string
  contentMale: string
  contentFemale: string
  tags: string[]
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
  language: 'en' | 'he'
}

const emailTemplatesCollection = 'emailTemplates'

export async function ensureCollectionExists() {
  const collectionRef = collection(db, emailTemplatesCollection)
  const snapshot = await getDocs(query(collectionRef, where('type', '==', 'placeholder')))
  
  if (snapshot.empty) {
    await setDoc(doc(collectionRef, 'placeholder'), {
      type: 'placeholder',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
}

export async function createEmailTemplate(
  user: User,
  template: Omit<EmailTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'language' | 'isPrivate'>
): Promise<EmailTemplate> {
  if (!user) throw new Error('User must be logged in to create a template')

  const docRef = await addDoc(collection(db, emailTemplatesCollection), {
    ...template,
    userId: user.uid,
    isPrivate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return {
    ...template,
    language: 'en',
    isPrivate: true,
    id: docRef.id,
    userId: user.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function getEmailTemplates(user: User): Promise<EmailTemplate[]> {
  if (!user) throw new Error('User must be logged in to fetch templates')

  try {
    // Query only for user's own templates
    const userTemplatesQuery = query(
      collection(db, emailTemplatesCollection),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    // Execute the query
    const userDocs = await getDocs(userTemplatesQuery);
    
    return userDocs.docs
      .filter(doc => doc.id !== 'placeholder')
      .map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as EmailTemplate[];
  } catch (error: any) {
    console.error('Error getting email templates:', error);
    throw new Error('Failed to fetch email templates: ' + (error.message || 'Unknown error'));
  }
}

export async function updateEmailTemplate(
  user: User,
  id: string,
  template: Partial<Omit<EmailTemplate, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  if (!user) throw new Error('User must be logged in to update a template')

  const docRef = doc(db, emailTemplatesCollection, id)
  await updateDoc(docRef, {
    ...template,
    updatedAt: new Date(),
  })
}

export async function deleteEmailTemplate(user: User, id: string): Promise<void> {
  if (!user) throw new Error('User must be logged in to delete a template')

  const docRef = doc(db, emailTemplatesCollection, id)
  await deleteDoc(docRef)
} 