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
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-800/20 via-zinc-900 to-black z-50">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 mb-4 relative">
            <div className="absolute inset-0 bg-violet-600/30 rounded-full animate-ping opacity-75 duration-1000"></div>
            <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full p-4 flex items-center justify-center">
              <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">Chargement...</h3>
          <p className="text-zinc-400 mt-2">Vérification de l&apos;authentification</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
