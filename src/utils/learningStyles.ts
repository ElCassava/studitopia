// Learning styles utility functions
import { getSupabaseClient } from '@/common/network'

export interface LearningStyle {
  id: string
  name: string
  description?: string
}

// Get all learning styles
export async function getLearningStyles(): Promise<LearningStyle[]> {
  try {
    const supabase = getSupabaseClient()
    
    const { data: styles, error } = await supabase
      .from('learning_styles')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching learning styles:', error)
      return []
    }
    
    return styles || []
  } catch (error) {
    console.error('Error in getLearningStyles:', error)
    return []
  }
}

// Get learning style by ID
export async function getLearningStyleById(styleId: string): Promise<LearningStyle | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data: style, error } = await supabase
      .from('learning_styles')
      .select('*')
      .eq('id', styleId)
      .single()
    
    if (error) {
      console.error('Error fetching learning style:', error)
      return null
    }
    
    return style
  } catch (error) {
    console.error('Error in getLearningStyleById:', error)
    return null
  }
}

// Update user's learning style
export async function updateUserLearningStyle(userId: string, styleId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from('users')
      .update({ learning_style_id: styleId })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating user learning style:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in updateUserLearningStyle:', error)
    return false
  }
}

// Check if user has a learning style assigned
export function hasLearningStyle(user: any): boolean {
  return !!(user?.learning_style_id)
}

// Get the current URL for return navigation
export function getCurrentUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname + window.location.search
  }
  return '/'
}
