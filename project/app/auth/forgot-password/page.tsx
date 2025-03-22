'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Melosphere v.1';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    
    if (!email) {
      setError("Veuillez saisir votre adresse email");
      return;
    }
    
    if (!email.includes('@')) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }
    
    // Simulation d'envoi d'email (pas de backend)
    try {
      // Ici, normalement, il y aurait un appel à l'API
      // Pour la démo, on simule une réussite
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.");
      setEmail('');
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de l'email");
    }
  };

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
      
      {/* Partie animation - À gauche */}
      <div className="w-3/5 flex flex-col items-center justify-center p-10">
        <div className="text-center mb-16">
          <h2 className="text-8xl font-extrabold text-black tracking-wider mb-4">
            {displayedText}
            <span className="animate-pulse">|</span>
          </h2>
          <p className="text-xl text-zinc-700 max-w-md mx-auto mt-4">
            Retrouvez l&apos;accès à votre compte en quelques instants
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <Link 
            href="/auth/login" 
            className="flex items-center text-violet-600 hover:text-violet-800 mb-6"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour à la connexion
          </Link>
        </div>
      </div>

      {/* Formulaire - À droite */}
      <div className="w-2/5 bg-black flex items-center justify-center">
        <div className="w-full max-w-md p-10">
          {/* Affichage des messages et erreurs au-dessus du titre */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-500/30 rounded-md">
              <p className="text-red-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {message && (
            <div className="mb-6 p-3 bg-green-900/30 border border-green-500/30 rounded-md">
              <p className="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                {message}
              </p>
            </div>
          )}
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-4">Mot de passe oublié ?</h1>
            <p className="text-zinc-400">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3">
              Envoyer le lien
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Image
              src="https://img.icons8.com/dotty/80/FFFFFF/mesh.png"
              alt="mesh"
              width={60}
              height={60}
              className="mx-auto mb-2 opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 