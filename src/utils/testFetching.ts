// Simple test script to check fetching functionality
import { getCourseById, getUserCourseProgress } from '@/common/courses';

const testUserId = '7a94e960-9da8-4a20-820a-938b9f0ec14b'; // admin user
const testCourseId = '35b8a545-de10-4450-824a-38abb30b67b9'; // first course

export async function testFetching() {
  console.log('Testing fetching functionality...');
  
  try {
    console.log('1. Testing getCourseById...');
    const course = await getCourseById(testCourseId, testUserId);
    console.log('Course data:', course);
    
    console.log('2. Testing getUserCourseProgress...');
    const progress = await getUserCourseProgress(testUserId, testCourseId);
    console.log('Progress data:', progress);
    
    return { success: true, course, progress };
  } catch (error) {
    console.error('Error in test fetching:', error);
    return { success: false, error };
  }
}
