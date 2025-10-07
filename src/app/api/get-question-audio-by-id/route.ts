import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/common/network'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    
    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    
    // Get audio data for the specific question ID from the database
    const { data: audioData, error: audioError } = await supabase
      .from('question_audio')
      .select(`
        id,
        question_id,
        audio_url,
        bucket_path,
        audio_title,
        duration,
        file_size,
        created_at
      `)
      .eq('question_id', questionId)
      .single()
    
    if (audioError) {
      if (audioError.code === 'PGRST116') {
        // No audio found for this question
        return NextResponse.json({ audio: null })
      }
      console.error('Error fetching question audio:', audioError)
      return NextResponse.json({ error: 'Failed to fetch audio data', details: audioError }, { status: 500 })
    }
    
    // Use local audio files from /public/audio-files/
    if (audioData && audioData.bucket_path) {
      // Extract just the file name from bucket_path (e.g., "Q2.mp3" from "audio-files/Q2.mp3")
      const fileName = audioData.bucket_path.replace('audio-files/', '')
      
      // Use local audio files instead of Supabase storage
      audioData.audio_url = `/audio-files/${fileName}`
    }
    
    return NextResponse.json({ 
      success: true,
      audio: audioData
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
