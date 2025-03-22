'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function RoomPage() {
  const { user } = useAuth();
  const [displayedText, setDisplayedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fullText = 'Melosphere v.1';

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

  // Simuler un temps de chargement lors de l'accès à la page
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Affichage du loader en plein écran pendant le chargement
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-violet-200 border-opacity-20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-violet-400 font-medium">Chargement en cours...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 p-8 flex flex-col items-center min-h-screen pt-24">
        <div className="text-center mb-16">
        </div>

        <Card className="max-w-2xl p-8 bg-zinc-900/50 border-violet-500/20">
          <div className="flex flex-col items-center gap-6 text-center">
            <Construction className="w-20 h-20 text-violet-500 animate-bounce" />
            
            <h1 className="text-3xl font-bold text-white">
              Page en Construction
            </h1>

            <div className="space-y-4 text-zinc-300">
              <p className="text-lg">
                Les Rooms arrivent bientôt sur Melosphere ! 
              </p>
              
              <p className="text-zinc-400">
                Les Rooms sont des espaces de partage où vous pourrez :
              </p>

              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>Créer des salons de discussion en temps réel</li>
                <li>Partager vos playlists préférées avec vos amis</li>
                <li>Écouter de la musique ensemble de manière synchronisée</li>
                <li>Découvrir de nouveaux morceaux grâce aux recommandations de la communauté</li>
              </ul>

              <p className="mt-8 text-violet-400 font-medium">
                Cette fonctionnalité sera disponible dans une prochaine mise à jour.
                Restez à l&apos;écoute !
              </p>
              
              <div className="mt-8">
                <a 
                  href="/"
                  className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
                >
                  Retour sur le site
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
