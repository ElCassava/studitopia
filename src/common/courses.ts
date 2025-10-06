// Course-related API functions using Supabase - Real Database Only
import { getSupabaseClient, getSupabaseAdminClient } from './network';

const supabase = getSupabaseClient();
const supabaseAdmin = getSupabaseAdminClient();

// Interface for course data
export interface Course {
  id: string;
  course_name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  is_enrolled?: boolean;
  progress?: number;
  // Additional course details
  title?: string;
  instructor?: string;
  duration?: string;
  level?: string;
  rating?: number;
  students?: number;
  sections?: {
    learn: number;
    test: number;
    quiz: number;
  };
}

// Interface for enrollment data
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage?: number;
}

// Interface for section progress tracking
export interface UserSectionProgress {
  id: string;
  user_id: string;
  course_section_id: string;
  section_type: 'learn' | 'test' | 'quiz';
  completed: boolean;
  completed_at?: string;
  score?: number;
}

// Interface for course section
export interface CourseSection {
  id: string;
  course_id: string;
  section_type: 'learn' | 'test' | 'quiz';
  created_at?: string;
  // For composite sections (when multiple learn_sections exist)
  course_section_id?: string;
  // Additional properties for learn sections
  title?: string;
  content?: string;
  estimatedTime?: string;
  description?: string;
  image_url?: string | null;
  displayIndex?: number;
  learn_section_id?: string | null;
  style_id?: string | null;
  // Additional properties for test/quiz sections
  questions?: Question[];
  // Test-specific properties
  timeLimit?: number;
  passingScore?: number;
}

// Interface for quiz/test questions
export interface Question {
  id?: number;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

// Fetch all courses from database
export async function getCourses(searchQuery?: string): Promise<Course[]> {
  try {
    console.log('Fetching courses from database');
    
    let query = supabase
      .from('courses')
      .select('*')
      .order('course_name', { ascending: true });

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      query = query.or(`course_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }

    return courses || [];
  } catch (error) {
    console.error('Error in getCourses:', error);
    return [];
  }
}

// Fetch courses for a specific user with enrollment status
export async function getCoursesForUser(userId: string, searchQuery?: string): Promise<Course[]> {
  try {
    console.log('Fetching courses for user:', userId);
    
    // Get all courses
    const courses = await getCourses(searchQuery);
    
    if (courses.length === 0) {
      return [];
    }

    // Get user's enrollments
    const client = supabaseAdmin || supabase;
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select('course_id, progress_percentage')
      .eq('user_id', userId);

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
      return courses.map(course => ({ ...course, is_enrolled: false, progress: 0 }));
    }

    // Create a map of enrolled courses with their progress
    const enrollmentMap = new Map();
    enrollments?.forEach(enrollment => {
      enrollmentMap.set(enrollment.course_id, enrollment.progress_percentage || 0);
    });

    // Mark courses as enrolled and add progress
    const coursesWithEnrollment = courses.map(course => ({
      ...course,
      is_enrolled: enrollmentMap.has(course.id),
      progress: enrollmentMap.get(course.id) || 0
    }));

    console.log('Courses with enrollment status:', coursesWithEnrollment.map(c => ({ 
      id: c.id, 
      name: c.course_name, 
      enrolled: c.is_enrolled,
      progress: c.progress
    })));

    return coursesWithEnrollment;
  } catch (error) {
    console.error('Error in getCoursesForUser:', error);
    return [];
  }
}

// Enroll user in a course
export async function enrollInCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    console.log('Enrolling user in course:', { userId, courseId });
    
    const client = supabaseAdmin || supabase;
    
    // Check if already enrolled
    const { data: existingEnrollment } = await client
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      console.log('User already enrolled in course');
      return true;
    }

    // Insert new enrollment
    const { error } = await client
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0
      });

    if (error) {
      console.error('Error enrolling in course:', error);
      return false;
    }

    console.log('Successfully enrolled in course');
    return true;
  } catch (error) {
    console.error('Error in enrollInCourse:', error);
    return false;
  }
}

// Check if user is enrolled in a course
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking enrollment:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isUserEnrolled:', error);
    return false;
  }
}

// Unenroll user from a course
export async function unenrollFromCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    console.log('Unenrolling user from course:', { userId, courseId });
    
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error unenrolling from course:', error);
      return false;
    }

    console.log('Successfully unenrolled from course');
    return true;
  } catch (error) {
    console.error('Error in unenrollFromCourse:', error);
    return false;
  }
}

// Get detailed course information by ID
export async function getCourseById(courseId: string, userId?: string): Promise<Course | null> {
  try {
    console.log('Fetching course by ID:', courseId);

    const client = supabaseAdmin || supabase;
    
    // Get course basic info
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error('Error fetching course:', courseError);
      return null;
    }

    // Get section counts
    const { data: sections, error: sectionsError } = await client
      .from('course_sections')
      .select('section_type')
      .eq('course_id', courseId);

    const sectionCounts = { learn: 0, test: 0, quiz: 0 };
    if (sections && !sectionsError) {
      sections.forEach(section => {
        if (section.section_type === 'learn') sectionCounts.learn++;
        else if (section.section_type === 'test') sectionCounts.test++;
        else if (section.section_type === 'quiz') sectionCounts.quiz++;
      });
    }

    // Get enrollment count
    const { count: enrollmentCount } = await client
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const studentCount = enrollmentCount || 0;

    // Check enrollment status and progress if userId provided
    let isEnrolled = false;
    let progress = 0;
    
    if (userId) {
      const { data: enrollment, error: enrollmentError } = await client
        .from('enrollments')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (!enrollmentError && enrollment) {
        isEnrolled = true;
        progress = enrollment.progress_percentage || 0;
      }
    }

    return {
      ...course,
      title: course.title || course.course_name,
      instructor: course.instructor || 'Instructor',
      duration: course.duration || '8 weeks',
      level: course.level || 'Beginner',
      rating: course.rating || 4.0,
      students: studentCount,
      sections: sectionCounts,
      is_enrolled: isEnrolled,
      progress: progress
    };

  } catch (error) {
    console.error('Error in getCourseById:', error);
    return null;
  }
}

// Mark a section as completed
export async function markSectionCompleted(
  userId: string, 
  courseId: string, 
  sectionId: string, 
  sectionType: 'learn' | 'test' | 'quiz',
  score?: number
): Promise<boolean> {
  try {
    console.log('Marking section as completed:', { userId, courseId, sectionId, sectionType, score });
    
    // Check which client to use
    if (!supabaseAdmin) {
      console.log('⚠️ No admin client available - using regular client with RLS');
      console.log('This app uses custom auth, not Supabase Auth');
      console.log('RLS policies expect auth.uid() but we use custom user IDs');
      console.log('This will likely fail unless service role key is configured');
    }
    
    const client = supabaseAdmin || supabase;
    
    // Verify the course section exists
    const { data: courseSection, error: sectionError } = await client
      .from('course_sections')
      .select('id, course_id, section_type')
      .eq('id', sectionId)
      .single();

    if (sectionError || !courseSection) {
      console.error('Course section not found:', sectionError);
      return false;
    }

    console.log('Course section verified:', courseSection);

    // Check if progress record already exists
    const { data: existingProgress, error: checkError } = await client
      .from('user_section_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_section_id', sectionId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing progress:', checkError);
      return false;
    }

    console.log('Existing progress:', existingProgress);

    const progressData = {
      user_id: userId,
      course_section_id: sectionId,
      section_type: sectionType,
      completed: true,
      completed_at: new Date().toISOString(),
      score: score || null
    };

    if (existingProgress) {
      // Update existing record
      console.log('Updating existing progress record...');
      const { error: updateError } = await client
        .from('user_section_progress')
        .update(progressData)
        .eq('id', existingProgress.id);

      if (updateError) {
        console.error('Error updating section progress:', updateError);
        return false;
      }
      console.log('Progress record updated successfully');
    } else {
      // Insert new record
      console.log('Inserting new progress record...');
      const { error: insertError } = await client
        .from('user_section_progress')
        .insert([progressData]);

      if (insertError) {
        console.error('Error inserting section progress:', insertError);
        return false;
      }
      console.log('New progress record inserted successfully');
    }

    // Update enrollment progress percentage
    console.log('Updating enrollment progress...');
    await updateEnrollmentProgress(userId, courseId);
    
    console.log(`✅ Section ${sectionId} marked as completed for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error in markSectionCompleted:', error);
    return false;
  }
}

// Helper function to update enrollment progress
async function updateEnrollmentProgress(userId: string, courseId: string): Promise<void> {
  try {
    const client = supabaseAdmin || supabase;
    
    // Get all sections for this course
    const { data: courseSections } = await client
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);

    if (!courseSections || courseSections.length === 0) {
      console.log('No course sections found for course:', courseId);
      return;
    }

    // Get completed sections for this user
    const sectionIds = courseSections.map(s => s.id);
    const { data: completedSections } = await client
      .from('user_section_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('course_section_id', sectionIds);

    // Calculate progress percentage
    const totalSections = courseSections.length;
    const completedCount = completedSections?.length || 0;
    const progressPercentage = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

    console.log(`Progress calculation: ${completedCount}/${totalSections} = ${progressPercentage}%`);

    // Update enrollment progress
    const { error: updateError } = await client
      .from('enrollments')
      .update({ progress_percentage: progressPercentage })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (updateError) {
      console.error('Error updating enrollment progress:', updateError);
    } else {
      console.log(`✅ Updated enrollment progress to ${progressPercentage}% for user ${userId} in course ${courseId}`);
    }
  } catch (error) {
    console.error('Error in updateEnrollmentProgress:', error);
  }
}

// Get user's progress for a specific course
export async function getUserCourseProgress(userId: string, courseId: string): Promise<{
  totalSections: number;
  completedSections: number;
  progressPercentage: number;
  sectionProgress: UserSectionProgress[];
} | null> {
  try {
    const client = supabaseAdmin || supabase;

    // Get all sections for this course
    const { data: courseSections, error: sectionsError } = await client
      .from('course_sections')
      .select('id, section_type')
      .eq('course_id', courseId);

    if (sectionsError || !courseSections) {
      console.error('Error fetching course sections:', sectionsError);
      return null;
    }

    // Get user's progress for these sections
    const sectionIds = courseSections.map(s => s.id);
    const { data: userProgress, error: progressError } = await client
      .from('user_section_progress')
      .select('*')
      .eq('user_id', userId)
      .in('course_section_id', sectionIds);

    if (progressError) {
      console.error('Error fetching user progress:', progressError);
      return null;
    }

    const totalSections = courseSections.length;
    const completedSections = userProgress?.filter(p => p.completed).length || 0;
    const progressPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    return {
      totalSections,
      completedSections,
      progressPercentage,
      sectionProgress: userProgress || []
    };
  } catch (error) {
    console.error('Error in getUserCourseProgress:', error);
    return null;
  }
}

// Reset user progress for a course
export async function resetCourseProgress(userId: string, courseId: string): Promise<boolean> {
  try {
    console.log('Resetting course progress for user:', userId, 'course:', courseId);
    
    const client = supabaseAdmin || supabase;

    // Get all section IDs for this course
    const { data: courseSections } = await client
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);

    if (!courseSections || courseSections.length === 0) {
      return true;
    }

    const sectionIds = courseSections.map(s => s.id);

    // Delete all progress records
    const { error } = await client
      .from('user_section_progress')
      .delete()
      .eq('user_id', userId)
      .in('course_section_id', sectionIds);

    if (error) {
      console.error('Error resetting course progress:', error);
      return false;
    }

    // Update enrollment progress to 0
    await client
      .from('enrollments')
      .update({ progress_percentage: 0 })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    console.log(`Course progress reset for user ${userId} in course ${courseId}`);
    return true;
  } catch (error) {
    console.error('Error in resetCourseProgress:', error);
    return false;
  }
}

// Get sections available for completion
export async function getNextAvailableSections(userId: string, courseId: string): Promise<{
  learn: CourseSection[];
  test: CourseSection[];
  quiz: CourseSection[];
} | null> {
  try {
    console.log('Getting available sections for user:', userId, 'course:', courseId);
    
    const client = supabaseAdmin || supabase;

    // Get all sections for this course
    const { data: courseSections, error: sectionsError } = await client
      .from('course_sections')
      .select('id, course_id, section_type')
      .eq('course_id', courseId)
      .order('section_type');

    if (sectionsError || !courseSections) {
      console.error('Error fetching course sections:', sectionsError);
      return null;
    }

    // Get completed sections
    const sectionIds = courseSections.map(s => s.id);
    const { data: completedSections } = await client
      .from('user_section_progress')
      .select('course_section_id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('course_section_id', sectionIds);

    const completedSectionIds = new Set(completedSections?.map(s => s.course_section_id) || []);

    // Filter available sections
    const availableSections = courseSections.filter(section => 
      !completedSectionIds.has(section.id)
    );

    // Group by type
    const groupedSections = {
      learn: availableSections.filter(s => s.section_type === 'learn'),
      test: availableSections.filter(s => s.section_type === 'test'),
      quiz: availableSections.filter(s => s.section_type === 'quiz')
    };

    return groupedSections;
  } catch (error) {
    console.error('Error in getNextAvailableSections:', error);
    return null;
  }
}

// Ensure course sections exist
export async function ensureCourseSectionsExist(courseId: string): Promise<boolean> {
  try {
    console.log('Ensuring course sections exist for course:', courseId);
    
    const client = supabaseAdmin || supabase;

    // Check existing sections
    const { data: existingSections, error: checkError } = await client
      .from('course_sections')
      .select('id, section_type')
      .eq('course_id', courseId);

    if (checkError) {
      console.error('Error checking existing sections:', checkError);
      return false;
    }

    // Count existing sections by type
    const existingCounts = {
      learn: existingSections?.filter(s => s.section_type === 'learn').length || 0,
      test: existingSections?.filter(s => s.section_type === 'test').length || 0,
      quiz: existingSections?.filter(s => s.section_type === 'quiz').length || 0
    };

    // Target section counts
    const targetCounts = { learn: 8, test: 2, quiz: 5 };
    
    // Create missing sections
    const sectionsToCreate = [];
    
    for (const [type, targetCount] of Object.entries(targetCounts)) {
      const existingCount = existingCounts[type as keyof typeof existingCounts];
      const needToCreate = targetCount - existingCount;
      
      for (let i = 0; i < needToCreate; i++) {
        sectionsToCreate.push({
          course_id: courseId,
          section_type: type
        });
      }
    }

    if (sectionsToCreate.length > 0) {
      const { error: insertError } = await client
        .from('course_sections')
        .insert(sectionsToCreate);

      if (insertError) {
        console.error('Error creating course sections:', insertError);
        return false;
      }

      console.log(`Created ${sectionsToCreate.length} course sections for course ${courseId}`);
    }

    return true;
  } catch (error) {
    console.error('Error in ensureCourseSectionsExist:', error);
    return false;
  }
}
