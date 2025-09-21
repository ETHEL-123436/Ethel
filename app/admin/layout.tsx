'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import '../globals.css';
import AdminLayout from '@/components/admin/AdminLayout';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full bg-gray-100">
        <head>
          <title>RideConnect Admin Dashboard</title>
          <meta name="description" content="Administrative dashboard for RideConnect rideshare platform" />
        </head>
        <body className={inter.className}>
          <AdminLayout>{children}</AdminLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}