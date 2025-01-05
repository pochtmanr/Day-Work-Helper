import { createClient } from '@supabase/supabase-js'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file)

  if (error) {
    throw new Error('Failed to upload image: ' + error.message)
  }

  return data
}
export async function getPublicUrl(path: string) {
  const { data } = await supabase.storage
    .from('images')
    .getPublicUrl(path)

  
  return data.publicUrl
} 
