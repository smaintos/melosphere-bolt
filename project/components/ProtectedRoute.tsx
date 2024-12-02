// components/ProtectedRoute.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Utilisateur non authentifié, redirection vers /auth/login');
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return <>{children}</>;
}
