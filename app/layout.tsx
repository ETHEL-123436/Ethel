import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RideConnect - Smart Ridesharing Platform',
  description: 'Connect with riders going in the same direction. Safe, affordable, and eco-friendly transportation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} high-contrast`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}