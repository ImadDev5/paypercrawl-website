"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check for invite token in URL params or cookies
    const urlToken = searchParams.get('token');
    const cookieToken = typeof window !== 'undefined'
      ? document.cookie
          .split(';')
          .find(row => row.trim().startsWith('invite_token='))
          ?.split('=')[1]
      : null;

    // If there's a readable invite token, user is allowed (AuthContext will validate)
    if (urlToken || cookieToken) return;

    // Wait for AuthContext to finish checking Supabase session
    if (isLoading) return;

    // No invite token and AuthContext says not authenticated → redirect
    if (!isAuthenticated) {
      console.log('Dashboard layout - no token and not authenticated, redirecting');
      router.replace('/waitlist');
    }
  }, [searchParams, router, isAuthenticated, isLoading]);

  return <>{children}</>;
}
