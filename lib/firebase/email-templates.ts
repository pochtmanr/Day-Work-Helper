import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
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
}

const emailTemplatesCollection = 'emailTemplates'

export async function createEmailTemplate(
  user: User,
  template: Omit<EmailTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<EmailTemplate> {
  if (!user) throw new Error('User must be logged in to create a template')

  const docRef = await addDoc(collection(db, emailTemplatesCollection), {
    ...template,
    userId: user.uid,
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

export async function getEmailTemplates(user: User): Promise<EmailTemplate[]> {
  if (!user) throw new Error('User must be logged in to fetch templates')

  const q = query(
    collection(db, emailTemplatesCollection),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as EmailTemplate[]
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