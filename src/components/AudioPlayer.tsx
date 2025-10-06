import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  audioTitle?: string
  duration?: number
  className?: string
}

export default function AudioPlayer({ audioUrl, audioTitle, duration, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 120)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Reset states when URL changes
    setHasError(false)
    setErrorMessage('')
    setIsPlaying(false)
    setCurrentTime(0)

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setHasError(true)
      setErrorMessage('Failed to load audio file')
    }

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const restart = () => {
    const audio = audioRef.current
    if (!audio) return
    
    audio.currentTime = 0
    setCurrentTime(0)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  if (hasError) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-full mr-3">
            <Volume2 className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-yellow-800 font-medium">🎧 Audio Unavailable</div>
            <div className="text-xs text-yellow-700">{errorMessage}</div>
            {audioTitle && (
              <div className="text-xs text-gray-600 mt-1 italic">
                Question: {audioTitle}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata" 
      />
      
      {audioTitle && (
        <div className="text-sm text-blue-800 font-medium mb-3 leading-tight">
          🎧 {audioTitle}
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>
        
        <button
          onClick={restart}
          className="flex-shrink-0 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
          aria-label="Restart"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        
        <div className="flex-1">
          <div className="bg-gray-200 rounded-full h-2 mb-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
