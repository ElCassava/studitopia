'use client'

import { useState, useEffect } from 'react'
import { getCourseById, getUserCourseProgress, CourseSection } from '@/common/courses'
import { getSupabaseClient } from '@/common/network'

export default function TestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  // Use the known IDs from our test data
  const testUserId = '7a94e960-9da8-4a20-820a-938b9f0ec14b'
  const testCourseId = '35b8a545-de10-4450-824a-38abb30b67b9'

  useEffect(() => {
    async function runTests() {
      const testResults: any = {}
      
      try {
        console.log('Testing getCourseById...')
        testResults.getCourseById = await getCourseById(testCourseId, testUserId)
        console.log('getCourseById result:', testResults.getCourseById)
      } catch (error) {
        console.error('getCourseById error:', error)
        testResults.getCourseById = { error: error instanceof Error ? error.message : 'Unknown error' }
      }

      try {
        console.log('Testing getUserCourseProgress...')
        testResults.getUserCourseProgress = await getUserCourseProgress(testUserId, testCourseId)
        console.log('getUserCourseProgress result:', testResults.getUserCourseProgress)
      } catch (error) {
        console.error('getUserCourseProgress error:', error)
        testResults.getUserCourseProgress = { error: error instanceof Error ? error.message : 'Unknown error' }
      }

      try {
        console.log('Testing direct Supabase course sections query...')
        const supabase = getSupabaseClient()
        const { data: courseSections, error: sectionsError } = await supabase
          .from('course_sections')
          .select('id, course_id, section_type')
          .eq('course_id', testCourseId)
          .eq('section_type', 'quiz')
          .order('created_at')
        
        testResults.directQuery = { data: courseSections, error: sectionsError }
        console.log('Direct query result:', testResults.directQuery)
      } catch (error) {
        console.error('Direct query error:', error)
        testResults.directQuery = { error: error instanceof Error ? error.message : 'Unknown error' }
      }

      setResults(testResults)
      setLoading(false)
    }

    runTests()
  }, [testUserId, testCourseId])

  if (loading) {
    return <div className="p-8">Loading tests...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Fetching Function Tests</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">getCourseById Result:</h2>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(results.getCourseById, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">getUserCourseProgress Result:</h2>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(results.getUserCourseProgress, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Direct Supabase Query Result:</h2>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(results.directQuery, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
