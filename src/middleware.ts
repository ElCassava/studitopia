import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define role-based routes
const ROLE_ROUTES = {
  student: '/student',
  teacher: '/teacher', 
  admin: '/admin'
} as const

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/student', '/teacher', '/admin']

// Define role-specific protected routes
const ROLE_SPECIFIC_ROUTES: Record<string, string[]> = {
  '/student': ['student'],
  '/teacher': ['teacher'], 
  '/admin': ['admin']
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only apply middleware to protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const currentUserCookie = request.cookies.get('currentUser')?.value
    
    if (!currentUserCookie) {
      // No authentication, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    try {
      const user = JSON.parse(decodeURIComponent(currentUserCookie))
      const userRole : string = user.role
      
      // Check if user has access to this specific route
      for (const [route, allowedRoles] of Object.entries(ROLE_SPECIFIC_ROUTES)) {
        if (pathname.startsWith(route)) {
          if (!allowedRoles.includes(userRole)) {
            // Wrong role, redirect to appropriate dashboard
            const userDashboard = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES]
            if (userDashboard && userDashboard !== pathname) {
              return NextResponse.redirect(new URL(userDashboard, request.url))
            }
          }
          break
        }
      }
    } catch (error) {
      // Invalid cookie data, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
