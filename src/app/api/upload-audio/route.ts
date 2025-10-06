import { NextRequest, NextResponse } from 'next/server'
import { uploadAudioFile, ensureAudioBucket, listAudioFiles } from '@/utils/audioUpload'
import { join } from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'list'
  
  try {
    switch (action) {
      case 'list':
        const listResult = await listAudioFiles()
        return NextResponse.json(listResult)
        
      case 'setup':
        // Ensure bucket exists
        const bucketResult = await ensureAudioBucket()
        if (!bucketResult.success) {
          return NextResponse.json(bucketResult, { status: 500 })
        }
        
        // Upload our test file
        const publicDir = join(process.cwd(), 'public')
        const localFilePath = join(publicDir, 'test-q2.aiff')
        
        const uploadResult = await uploadAudioFile(localFilePath, 'Q2.mp3')
        
        return NextResponse.json({
          success: true,
          bucket: bucketResult,
          upload: uploadResult
        })
        
      case 'test-upload':
        // Just upload the test file
        const testPublicDir = join(process.cwd(), 'public')
        const testFilePath = join(testPublicDir, 'test-q2.aiff')
        
        const testUploadResult = await uploadAudioFile(testFilePath, 'Q2.aiff')
        
        return NextResponse.json(testUploadResult)
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in upload-audio API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'upload-test-file') {
      // Upload our local test file as Q2.mp3
      const publicDir = join(process.cwd(), 'public')
      const localFilePath = join(publicDir, 'test-q2.aiff')
      
      const result = await uploadAudioFile(localFilePath, 'Q2.aiff')
      
      return NextResponse.json(result)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in POST upload-audio:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
