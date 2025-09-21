import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface SessionClaims {
  metadata?: {
    role?: 'admin' | 'user' | string;  // Add other possible role values if needed
    [key: string]: string | number | boolean | null | undefined;
  };
  [key: string]: unknown;  // More type-safe than 'any' as it requires type checking before use
}

// Define public routes that don't require authentication
const publicRoutes = createRouteMatcher([
  '/',
  '/api/webhook/clerk',
  // Add any other public routes here
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  // Add other protected routes here
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware for public routes
  if (publicRoutes(req)) return NextResponse.next();
  
  // For protected routes, check authentication
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims, redirectToSignIn } = await auth();
    
    // If user is not authenticated, redirect to sign-in
    if (!userId) {
      return redirectToSignIn();
    }

    // Check for admin access on admin routes
    const userEmail = (sessionClaims as any)?.email_addresses?.[0]?.email_address || '';
    const clerkUserId = (sessionClaims as any)?.sub;
    
    // Admin credentials
    const ADMIN_EMAIL = 'enowethel954@gmail.com';
    const ADMIN_USER_ID = 'user_32hm0O3QbKmKInAZKIchMd9aLH3';
    
    const isAdmin = userEmail === ADMIN_EMAIL || clerkUserId === ADMIN_USER_ID;
    
    if (req.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};