import { clerkMiddleware, createRouteMatcher, auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface EmailAddress {
  email_address: string;
  id?: string;
  verification?: {
    status: string;
    strategy: string;
  };
}

interface SessionClaims {
  email_addresses: EmailAddress[];
  sub?: string;
  public_metadata?: {
    role?: 'admin' | 'user' | string;
    isKycVerified?: boolean;
    [key: string]: unknown;
  };
}

interface PublicMetadata {
  role?: 'admin' | 'user' | string;
  isKycVerified?: boolean;
}

// Extended type for Clerk's session claims
interface ClerkSessionClaims extends Record<string, unknown> {
  email_addresses?: EmailAddress[];
  sub?: string;
  public_metadata?: PublicMetadata;
}

interface AuthSession {
  userId: string | null;
  sessionClaims: SessionClaims | null;
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
  '/driver(.*)',
  '/passenger(.*)',
  // Add other protected routes here
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims: clerkClaims } = await auth();
  const isPublicRoute = publicRoutes(req);

  // Allow public routes and API routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Process session claims
  const sessionClaims: SessionClaims | null = clerkClaims ? {
    ...clerkClaims,
    email_addresses: (clerkClaims as ClerkSessionClaims).email_addresses || []
  } : null;

  // Get user role and verification status
  const userRole = (sessionClaims?.public_metadata as PublicMetadata)?.role;
  const isKycVerified = (sessionClaims?.public_metadata as PublicMetadata)?.isKycVerified;
  const userEmail = sessionClaims?.email_addresses?.[0]?.email_address ?? '';

  // Admin credentials
  const ADMIN_EMAIL = 'enowethel954@gmail.com';
  const ADMIN_USER_ID = 'user_32hm0O3QbKmKInAZKIchMd9aLH3';
  const isAdmin = userEmail === ADMIN_EMAIL || userId === ADMIN_USER_ID;

  // Debug log
  console.log('Middleware - User:', {
    userId,
    userEmail,
    userRole,
    isKycVerified,
    isAdmin,
    path: req.nextUrl.pathname
  });

  // Handle role-based routing
  if (isProtectedRoute(req)) {
    // If no role is set, redirect to onboarding
    if (!userRole) {
      console.log('No role set, redirecting to onboarding');
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Handle admin routes first (admins can access any route)
    if (isAdmin) {
      console.log('Admin access granted');
      return NextResponse.next();
    }

    // Handle driver routes
    if (req.nextUrl.pathname.startsWith('/driver')) {
      if (userRole !== 'driver') {
        console.log('Not a driver, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (!isKycVerified && !req.nextUrl.pathname.startsWith('/driver/kyc-verification')) {
        console.log('Driver not KYC verified, redirecting to KYC');
        return NextResponse.redirect(new URL('/driver/kyc-verification', req.url));
      }
      return NextResponse.next();
    }

    // Handle passenger routes
    if (req.nextUrl.pathname.startsWith('/passenger')) {
      if (userRole !== 'passenger') {
        console.log('Not a passenger, checking if driver');
        if (userRole === 'driver') {
          return NextResponse.redirect(new URL('/driver/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/onboarding?role=passenger', req.url));
      }
      return NextResponse.next();
    }

    // Handle admin routes (if not already handled by isAdmin check above)
    if (req.nextUrl.pathname.startsWith('/admin')) {
      console.log('Not an admin, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  console.log('Allowing access to:', req.nextUrl.pathname);
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};