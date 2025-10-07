'use client'
import { useState } from 'react'

export default function TestLearningStyleSave() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-learning-style-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '7a94e960-9da8-4a20-820a-938b9f0ec14b', // admin user
          styleName: 'visual'
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Learning Style Save</h1>
      
      <button 
        onClick={testSave}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Save Learning Style'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
