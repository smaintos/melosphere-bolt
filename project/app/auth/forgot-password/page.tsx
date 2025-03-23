'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSecretQuestion, resetPassword } from '@/lib/api';
import { ClipboardIcon, ClipboardCheckIcon } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [secretQuestion, setSecretQuestion] = useState<string | null>(null);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [step, setStep] = useState(1); // 1: email input, 2: secret question, 3: password display
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fullText = 'Melosphere v.1';
  const router = useRouter();

  const secretQuestionMap: Record<string, string> = {
    'pet': 'Quel est le nom de votre premier animal de compagnie ?',
    'city': 'Dans quelle ville êtes-vous né(e) ?',
    'school': 'Quel est le nom de votre école primaire ?',
    'food': 'Quel est votre plat préféré ?',
    'color': 'Quelle est votre couleur préférée ?'
  };

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await getSecretQuestion(email);
      if (response.userId && response.secretQuestion) {
        setUserId(response.userId);
        setSecretQuestion(response.secretQuestion);
        setStep(2);
      } else {
        setError("Impossible de récupérer la question secrète. Veuillez réessayer.");
      }
    } catch (err: any) {
      setError(err.message || "Adresse email non trouvée");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);
    
    try {
      if (!userId) {
        throw new Error("ID utilisateur manquant. Veuillez recommencer.");
      }
      
      const response = await resetPassword(userId, secretAnswer);
      if (response.success && response.newPassword) {
        setNewPassword(response.newPassword);
        setMessage("Votre mot de passe a été réinitialisé avec succès.");
        setStep(3);
      } else {
        throw new Error("Impossible de réinitialiser le mot de passe.");
      }
    } catch (err: any) {
      setError(err.message || "La réponse à la question secrète est incorrecte.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Erreur lors de la copie:', err);
        });
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
              {step === 1 
                ? "Entrez votre adresse email pour accéder à votre question secrète" 
                : step === 2 
                  ? "Répondez à votre question secrète pour réinitialiser votre mot de passe" 
                  : "Voici votre nouveau mot de passe"}
            </p>
          </div>
          
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
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
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3" disabled={isLoading}>
                {isLoading ? 'Vérification...' : 'Continuer'}
              </Button>
            </form>
          ) : step === 2 ? (
            <form className="space-y-6" onSubmit={handleAnswerSubmit}>
              <div className="space-y-2">
                <p className="text-white mb-2 font-medium">{secretQuestion && secretQuestionMap[secretQuestion]}</p>
                <Input
                  type="text"
                  placeholder="Votre réponse"
                  value={secretAnswer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3" disabled={isLoading}>
                {isLoading ? 'Vérification...' : 'Réinitialiser mon mot de passe'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-md p-4">
                <p className="text-zinc-400 text-sm mb-2">Votre nouveau mot de passe :</p>
                <div className="flex items-center justify-between bg-zinc-900 rounded p-3">
                  <code className="text-green-400 font-mono text-base">{newPassword}</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    {isCopied ? 
                      <ClipboardCheckIcon className="h-5 w-5 text-green-500" /> : 
                      <ClipboardIcon className="h-5 w-5" />
                    }
                  </Button>
                </div>
                <p className="text-amber-400 text-xs mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Notez ce mot de passe ou copiez-le, vous en aurez besoin pour vous connecter !
                </p>
              </div>
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3"
                onClick={() => router.push('/auth/login')}
              >
                Aller à la page de connexion
              </Button>
            </div>
          )}

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