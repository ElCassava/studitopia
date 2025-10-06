import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const relatedTable = searchParams.get('table') // e.g., 'test_questions'
    const relatedId = searchParams.get('id') // e.g., question UUID
    
    if (!relatedTable || !relatedId) {
      return NextResponse.json({ 
        error: 'Both table and id parameters are required' 
      }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    
    // Get audio files for the specific entity
    const { data: audioFiles, error: audioError } = await supabase
      .from('audio_files')
      .select(`
        id,
        file_name,
        file_url,
        duration,
        file_size,
        related_table,
        related_id,
        uploaded_at
      `)
      .eq('related_table', relatedTable)
      .eq('related_id', relatedId)
      .order('uploaded_at', { ascending: false })
    
    if (audioError) {
      console.error('Error fetching audio files:', audioError)
      return NextResponse.json({ 
        error: 'Failed to fetch audio files', 
        details: audioError 
      }, { status: 500 })
    }
    
    if (!audioFiles || audioFiles.length === 0) {
      return NextResponse.json({ 
        success: true,
        audio: null,
        message: 'No audio files found for this content'
      })
    }
    
    // Return the first (most recent) audio file
    const audioFile = audioFiles[0]
    
    // Test if the URL is accessible
    let isAccessible = false
    try {
      const testResponse = await fetch(audioFile.file_url, { method: 'HEAD' })
      isAccessible = testResponse.ok
    } catch (error) {
      console.log('Audio file not accessible:', error)
    }
    
    return NextResponse.json({ 
      success: true,
      audio: {
        ...audioFile,
        is_accessible: isAccessible,
        total_files: audioFiles.length
      },
      all_audio_files: audioFiles // Include all files in case there are multiple
    })
    
  } catch (error) {
    console.error('Error in get-audio-files API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      fileName, 
      fileUrl, 
      duration, 
      fileSize, 
      relatedTable, 
      relatedId 
    } = body
    
    if (!fileName || !fileUrl || !relatedTable || !relatedId) {
      return NextResponse.json({ 
        error: 'fileName, fileUrl, relatedTable, and relatedId are required' 
      }, { status: 400 })
    }
    
    // Validate relatedTable
    const allowedTables = ['learn_contents', 'test_questions', 'quiz_contents', 'learning_style_test']
    if (!allowedTables.includes(relatedTable)) {
      return NextResponse.json({ 
        error: `Invalid relatedTable. Must be one of: ${allowedTables.join(', ')}` 
      }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    
    // Insert the audio file record
    const { data: audioFile, error: insertError } = await supabase
      .from('audio_files')
      .insert([{
        file_name: fileName,
        file_url: fileUrl,
        duration: duration || null,
        file_size: fileSize || null,
        related_table: relatedTable,
        related_id: relatedId
      }])
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting audio file:', insertError)
      return NextResponse.json({ 
        error: 'Failed to save audio file record', 
        details: insertError 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      audio: audioFile,
      message: 'Audio file record created successfully'
    })
    
  } catch (error) {
    console.error('Error in POST audio-files API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
