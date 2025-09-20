'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import KycDemo from '@/components/KycDemo';

export default function DriverKycVerification() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user is already verified or not a driver
      const role = user.unsafeMetadata?.role;
      const isKycVerified = user.unsafeMetadata?.isKycVerified;
      
      if (role !== 'driver') {
        router.push('/');
      } else if (isKycVerified) {
        router.push('/driver/dashboard');
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleKycSuccess = async () => {
    try {
      // Update user metadata to mark KYC as verified
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          isKycVerified: true,
          kycVerifiedAt: new Date().toISOString()
        }
      });
      
      // Redirect to driver dashboard
      router.push('/driver/dashboard');
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Verification</h1>
          <p className="text-gray-700">Complete your KYC verification to start accepting rides</p>
        </div>
        <KycDemo onSuccess={handleKycSuccess} />
      </div>
    </div>
  );
}
