'use client';

import { Suspense, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

type UserRole = 'passenger' | 'driver';

interface UserMetadata {
  role?: UserRole;
  isKycVerified?: boolean;
}

type UserWithMetadata = {
  firstName: string | null;
  update: (params: { unsafeMetadata: UserMetadata }) => Promise<void>;
  unsafeMetadata?: UserMetadata;
};

// Main content component that uses useSearchParams
function OnboardingContent() {
  const { user, isLoaded: isUserLoaded } = useUser() as { user: UserWithMetadata | null; isLoaded: boolean };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const role = searchParams.get('role') as UserRole | null;
    if (role && (role === 'passenger' || role === 'driver')) {
      setSelectedRole(role);
    }
  }, [searchParams]);

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;
    
    setIsLoading(true);
    
    try {
      // Update user metadata with selected role
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          role: selectedRole
        } as UserMetadata
      });
      
      // Redirect to appropriate dashboard or KYC verification
      const redirectPath = selectedRole === 'driver' 
        ? user.unsafeMetadata?.isKycVerified 
          ? '/driver/dashboard' 
          : '/driver/kyc-verification'
        : '/passenger/dashboard';
        
      router.push(redirectPath);
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUserLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RideConnect, {user.firstName || 'there'}!
          </h1>
          <p className="text-lg text-gray-800 max-w-2xl mx-auto">
            Let&apos;s get you set up. Choose your role to customize your experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Passenger Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedRole === 'passenger' 
                ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedRole('passenger')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className={`h-8 w-8 ${selectedRole === 'passenger' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <CardTitle className="text-2xl">I am a Passenger</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-800 mb-6">
                Looking for affordable, convenient rides to your destination.
              </p>
              <ul className="text-sm space-y-3 text-left max-w-sm mx-auto">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Find rides going your way</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Split travel costs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Meet fellow travelers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Eco-friendly travel</span>
                </li>
              </ul>
              {selectedRole === 'passenger' && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Selected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedRole === 'driver' 
                ? 'ring-2 ring-green-500 shadow-lg bg-green-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedRole('driver')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Car className={`h-8 w-8 ${selectedRole === 'driver' ? 'text-green-600' : 'text-green-500'}`} />
              </div>
              <CardTitle className="text-2xl">I am a Driver</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-800 mb-6">
                Want to earn money by giving rides to passengers.
              </p>
              <ul className="text-sm space-y-3 text-left max-w-sm mx-auto">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Earn money on your schedule</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Meet new people</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Help reduce traffic and emissions</span>
                </li>
              </ul>
              {selectedRole === 'driver' && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Selected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className="w-full py-6 text-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue as {selectedRole || '...'} <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that uses Suspense
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}