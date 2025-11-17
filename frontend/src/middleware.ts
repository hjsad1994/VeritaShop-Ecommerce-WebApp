import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/orders',
  '/profile',
  '/settings',
  '/admin',
  '/checkout',
];

// Define auth routes (accessible only when not authenticated)
const authRoutes = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and system routes
  if (pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/debug-auth')) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // For now, we'll rely on client-side protection since we're using localStorage
  // This avoids breaking the current authentication system
  // When backend implements JWT cookies, we can enable server-side protection

  // If using localStorage-based auth, let client-side AuthGuard handle protection
  // This is a temporary solution until proper JWT implementation

  // Continue with the request - AuthGuard will handle client-side protection
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
