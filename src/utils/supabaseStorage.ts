import { getSupabaseClient } from '@/common/network'

/**
 * Generate a public URL for a Supabase storage object
 * @param bucketName The name of the storage bucket
 * @param filePath The path to the file within the bucket
 * @returns Public URL for the file
 */
export function getSupabaseStorageUrl(bucketName: string, filePath: string): string {
  const supabase = getSupabaseClient()
  
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

/**
 * Generate a signed URL for a Supabase storage object (for private files)
 * @param bucketName The name of the storage bucket  
 * @param filePath The path to the file within the bucket
 * @param expiresIn Expiration time in seconds (default: 1 hour)
 * @returns Promise resolving to signed URL
 */
export async function getSupabaseSignedUrl(
  bucketName: string, 
  filePath: string, 
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn)
  
  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
  
  return data.signedUrl
}

/**
 * Check if a file exists in Supabase storage
 * @param bucketName The name of the storage bucket
 * @param filePath The path to the file within the bucket
 * @returns Promise resolving to boolean indicating if file exists
 */
export async function checkSupabaseFileExists(bucketName: string, filePath: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(filePath.split('/').slice(0, -1).join('/'), {
      search: filePath.split('/').pop()
    })
  
  if (error) {
    console.error('Error checking file existence:', error)
    return false
  }
  
  return data && data.length > 0
}
