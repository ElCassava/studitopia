import React from 'react'

interface DebugInfoProps {
  data: Record<string, any>
}

export default function DebugInfo({ data }: DebugInfoProps) {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-2">Debug Information</h3>
      <div className="text-xs text-yellow-700 space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex">
            <span className="font-mono font-semibold mr-2">{key}:</span>
            <span className="font-mono">
              {typeof value === 'object' 
                ? JSON.stringify(value, null, 2) 
                : String(value)
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
