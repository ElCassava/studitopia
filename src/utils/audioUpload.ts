import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Upload a local audio file to Supabase storage
 */
export async function uploadAudioFile(localFilePath: string, storageFilePath: string) {
  try {
    // Read the local file
    const fileBuffer = readFileSync(localFilePath)
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(storageFilePath, fileBuffer, {
        contentType: 'audio/mpeg', // or 'audio/aiff' depending on the file
        upsert: true // Overwrite if exists
      })
    
    if (error) {
      console.error('Error uploading file:', error)
      return { success: false, error }
    }
    
    console.log('File uploaded successfully:', data)
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(storageFilePath)
    
    return { 
      success: true, 
      data, 
      publicUrl: urlData.publicUrl 
    }
    
  } catch (error) {
    console.error('Error in uploadAudioFile:', error)
    return { success: false, error }
  }
}

/**
 * Check if the audio-files bucket exists and create it if not
 */
export async function ensureAudioBucket() {
  try {
    // List buckets to check if audio-files exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return { success: false, error: listError }
    }
    
    const audioBucket = buckets?.find(bucket => bucket.name === 'audio-files')
    
    if (!audioBucket) {
      console.log('Creating audio-files bucket...')
      const { data, error } = await supabase.storage.createBucket('audio-files', {
        public: true,
        allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/wav', 'audio/ogg']
      })
      
      if (error) {
        console.error('Error creating bucket:', error)
        return { success: false, error }
      }
      
      console.log('Audio bucket created successfully:', data)
    } else {
      console.log('Audio-files bucket already exists')
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Error in ensureAudioBucket:', error)
    return { success: false, error }
  }
}

/**
 * List files in the audio-files bucket
 */
export async function listAudioFiles() {
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list()
    
    if (error) {
      console.error('Error listing files:', error)
      return { success: false, error }
    }
    
    console.log('Files in audio-files bucket:', data)
    return { success: true, files: data }
    
  } catch (error) {
    console.error('Error in listAudioFiles:', error)
    return { success: false, error }
  }
}
