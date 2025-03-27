// app/layout.tsx

'use client';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ConditionalSidebar from '../components/ConditionalSidebar';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="flex min-h-screen bg-zinc-950">
        <AuthProvider>
          <SocketProvider>
            <ConditionalSidebar />
            <main className="flex-1 p-8">
              {children}
            </main>
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
