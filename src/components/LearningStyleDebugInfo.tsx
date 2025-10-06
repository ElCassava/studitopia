'use client'

import React from 'react'
import { useAuth } from '@/common/AuthContext'
import { hasLearningStyle } from '@/utils/learningStyles'

export default function LearningStyleDebugInfo() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs max-w-sm">
      <div className="font-bold text-green mb-1">Debug Info:</div>
      <div><strong>User:</strong> {user.username}</div>
      <div><strong>Role:</strong> {user.role}</div>
      <div>
        <strong>Learning Style:</strong> 
        <span className={hasLearningStyle(user) ? 'text-green' : 'text-red-600 font-medium'}>
          {user.learning_style_id ? ` ${user.learning_style_id}` : ' Not Set'}
        </span>
      </div>
      <div>
        <strong>Has Style:</strong> 
        <span className={hasLearningStyle(user) ? 'text-green' : 'text-red-600'}>
          {hasLearningStyle(user) ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  )
}
