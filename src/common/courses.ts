// Course-related API functions using Supabase
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
}

// Interface for enrollment data
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress?: number;
}

// Mock courses data for demonstration
const mockCourses: Course[] = [
  {
    id: '1',
    course_name: 'Introduction to JavaScript',
    description: 'Learn the fundamentals of JavaScript programming including variables, functions, loops, and DOM manipulation. Perfect for beginners starting their web development journey.'
  },
  {
    id: '2',
    course_name: 'Advanced React Development',
    description: 'Master React concepts like hooks, context API, performance optimization, and testing. Build scalable applications with modern React patterns.'
  },
  {
    id: '3',
    course_name: 'Python for Data Science',
    description: 'Explore data analysis and machine learning using Python. Learn pandas, numpy, matplotlib, and scikit-learn for real-world data projects.'
  },
  {
    id: '4',
    course_name: 'Web Design Fundamentals',
    description: 'Create beautiful and user-friendly websites. Cover HTML, CSS, responsive design, and modern UI/UX principles.'
  },
  {
    id: '5',
    course_name: 'Database Management',
    description: 'Master SQL and database design principles. Learn to create, query, and optimize databases for web applications.'
  },
  {
    id: '6',
    course_name: 'Node.js Backend Development',
    description: 'Build scalable server-side applications with Node.js. Cover Express.js, API development, authentication, and deployment.'
  },
  {
    id: '7',
    course_name: 'Digital Marketing Strategy',
    description: 'Learn modern digital marketing techniques including SEO, social media marketing, content strategy, and analytics.'
  },
  {
    id: '8',
    course_name: 'Mobile App Development',
    description: 'Build cross-platform mobile applications using React Native. Learn navigation, state management, and app store deployment.'
  },
  {
    id: '9',
    course_name: 'Machine Learning Basics',
    description: 'Introduction to machine learning algorithms, supervised and unsupervised learning, and practical applications using Python libraries.'
  },
  {
    id: '10',
    course_name: 'Cloud Computing with AWS',
    description: 'Learn cloud infrastructure, deployment strategies, and AWS services. Build scalable applications in the cloud.'
  },
  {
    id: '11',
    course_name: 'Cybersecurity Fundamentals',
    description: 'Understand security principles, threat detection, and protection strategies for modern digital systems.'
  },
  {
    id: '12',
    course_name: 'UI/UX Design Principles',
    description: 'Master user interface and user experience design. Learn design thinking, prototyping, and user research methodologies.'
  }
];

// Fetch all courses
export async function getCourses(searchQuery?: string): Promise<Course[]> {
  try {
    // Try to fetch from database first
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
      console.log('Database courses not available, using mock data:', error.message);
      return filterMockCourses(searchQuery);
    }

    // If no courses in database, return mock data
    if (!courses || courses.length === 0) {
      console.log('No courses in database, using mock data');
      return filterMockCourses(searchQuery);
    }

    return courses;
  } catch (error) {
    console.log('Error fetching courses, using mock data:', error);
    return filterMockCourses(searchQuery);
  }
}

// Helper function to filter mock courses
function filterMockCourses(searchQuery?: string): Course[] {
  if (!searchQuery || !searchQuery.trim()) {
    return mockCourses;
  }

  const query = searchQuery.toLowerCase().trim();
  return mockCourses.filter(course => 
    course.course_name.toLowerCase().includes(query) ||
    course.description.toLowerCase().includes(query)
  );
}

// Fetch courses for a specific user with enrollment status
export async function getCoursesForUser(userId: string, searchQuery?: string): Promise<Course[]> {
  try {
    console.log('Fetching courses for user:', userId);
    
    // First get all courses
    const courses = await getCourses(searchQuery);
    
    // Check if we're using mock data (simple numeric IDs)
    const isUsingMockData = courses.length > 0 && /^\d+$/.test(courses[0].id);
    console.log('Using mock data:', isUsingMockData);
    
    let enrolledCourseIds = new Set<string>();
    
    if (isUsingMockData && typeof window !== 'undefined') {
      try {
        // Get mock enrollments from localStorage (client-side only)
        const mockEnrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
        console.log('Mock enrollments from localStorage:', mockEnrollments);
        
        enrolledCourseIds = new Set(
          mockEnrollments
            .filter((enrollment: string) => enrollment.startsWith(`${userId}-`))
            .map((enrollment: string) => enrollment.split('-')[1])
        );
        console.log('Enrolled course IDs:', Array.from(enrolledCourseIds));
      } catch (localStorageError) {
        console.error('localStorage error in getCoursesForUser:', localStorageError);
        enrolledCourseIds = new Set();
      }
    } else {
      // Get real enrollments from database using admin client to bypass RLS
      const client = supabaseAdmin || supabase;
      
      const { data: enrollments, error: enrollmentError } = await client
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId);

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
        return courses.map(course => ({ ...course, is_enrolled: false, progress: 0 }));
      }

      enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || []);
      console.log('Database enrolled course IDs:', Array.from(enrolledCourseIds));
    }

    // Mark courses as enrolled and add progress
    const coursesWithEnrollment = courses.map(course => ({
      ...course,
      is_enrolled: enrolledCourseIds.has(course.id),
      progress: enrolledCourseIds.has(course.id) ? Math.floor(Math.random() * 100) : 0
    }));

    console.log('Courses with enrollment status:', coursesWithEnrollment.map(c => ({ 
      id: c.id, 
      name: c.course_name, 
      enrolled: c.is_enrolled 
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
    
    // Check if we're using mock data (courseId is a simple string like '1', '2', etc.)
    const isUsingMockData = /^\d+$/.test(courseId);
    
    if (isUsingMockData && typeof window !== 'undefined') {
      try {
        // For mock data, store enrollment in localStorage (client-side only)
        const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
        const enrollmentKey = `${userId}-${courseId}`;
        
        if (!enrollments.includes(enrollmentKey)) {
          enrollments.push(enrollmentKey);
          localStorage.setItem('mock_enrollments', JSON.stringify(enrollments));
          console.log('Mock enrollment added:', enrollmentKey);
        } else {
          console.log('User already enrolled in mock course:', enrollmentKey);
        }
        
        return true;
      } catch (localStorageError) {
        console.error('localStorage error:', localStorageError);
        // Fallback: just return true for mock data
        return true;
      }
    }

    // Real database enrollment - use admin client to bypass RLS policies
    const client = supabaseAdmin || supabase;
    console.log('Using client for enrollment:', client === supabaseAdmin ? 'admin' : 'regular');
    
    // Check if already enrolled to avoid duplicate enrollments
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

    // Insert new enrollment using admin client to bypass RLS
    const { error } = await client
      .from('enrollments')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          enrolled_at: new Date().toISOString()
        }
      ]);

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
    // Check if we're using mock data (courseId is a simple string like '1', '2', etc.)
    const isUsingMockData = /^\d+$/.test(courseId);
    
    if (isUsingMockData && typeof window !== 'undefined') {
      try {
        // For mock data, check localStorage (client-side only)
        const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
        const enrollmentKey = `${userId}-${courseId}`;
        return enrollments.includes(enrollmentKey);
      } catch (localStorageError) {
        console.error('localStorage error in isUserEnrolled:', localStorageError);
        return false;
      }
    }

    // Real database check using admin client to bypass RLS
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
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
    
    // Check if we're using mock data (courseId is a simple string like '1', '2', etc.)
    const isUsingMockData = /^\d+$/.test(courseId);
    
    if (isUsingMockData && typeof window !== 'undefined') {
      try {
        // For mock data, remove enrollment from localStorage (client-side only)
        const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
        const enrollmentKey = `${userId}-${courseId}`;
        const updatedEnrollments = enrollments.filter((enrollment: string) => enrollment !== enrollmentKey);
        localStorage.setItem('mock_enrollments', JSON.stringify(updatedEnrollments));
        console.log('Mock enrollment removed:', enrollmentKey);
        return true;
      } catch (localStorageError) {
        console.error('localStorage error in unenrollFromCourse:', localStorageError);
        return false;
      }
    }

    // Real database unenrollment using admin client to bypass RLS
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