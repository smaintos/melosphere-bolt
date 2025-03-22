'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fullText = 'Melosphere v.1';
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        currentIndex = 0;
        setDisplayedText('');
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await loginUser(email, password);
      login(data.token);
      
      // Délai intentionnel pour voir le loader
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      if (err.message.includes("utilisateur non trouvé") || err.message.includes("not found")) {
        setError("Cet email n'est associé à aucun compte");
      } else if (err.message.includes("mot de passe") || err.message.includes("password")) {
        setError("Mot de passe incorrect");
      } else {
        setError(err.message || "Erreur de connexion");
      }
    }
  };

  // Affichage du loader en plein écran si isLoading est true
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-violet-200 border-opacity-20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-violet-400 font-medium">Connexion en cours...</p>
      </div>
    );
  }

  return (
    <div className="split-background">
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        
        #__next, main {
          height: 100%;
          width: 100%;
        }
        
        .split-background {
          display: flex;
          width: 100vw;
          height: 100vh;
          position: absolute;
          top: 0;
          left: 0;
          overflow: hidden;
        }
        
        .split-background::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 60%;
          height: 100%;
          background-color: white;
          z-index: -1;
        }
        
        .split-background::after {
          content: "";
          position: absolute;
          right: 0;
          top: 0;
          width: 40%;
          height: 100%;
          background-color: black;
          z-index: -1;
        }
      `}</style>
      
      <div className="w-3/5 flex items-center justify-center">
        <div className="w-full max-w-lg p-10">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-300 rounded-md">
              <p className="text-red-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-zinc-800 ml-24">Connexion</h1>
            <Image
              src="https://img.icons8.com/dotty/80/mesh.png"
              alt="mesh"
              width={80}
              height={80}
            />
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border border-zinc-200 text-zinc-800"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border border-zinc-200 text-zinc-800"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3">
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-600">
            <Link href="/auth/register" className="hover:text-violet-800">Créer un compte</Link>
            <span className="mx-2">•</span>
            <Link href="/auth/forgot-password" className="hover:text-violet-800">Mot de passe oublié</Link>
          </div>
        </div>
      </div>

      {/* Partie droite - Animation */}
      <div className="w-2/5 flex items-center justify-center">
        <h2 className="text-7xl font-extrabold text-white tracking-wider">
          {displayedText}
          <span className="animate-pulse">|</span>
        </h2>
      </div>
    </div>
  );
}
