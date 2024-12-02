// app/layout.tsx

'use client';

import { AuthProvider } from './context/AuthContext';
import ConditionalSidebar from '../components/ConditionalSidebar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="flex min-h-screen bg-zinc-950">
      <AuthProvider>
          <ConditionalSidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
