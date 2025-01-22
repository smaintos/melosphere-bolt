"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPlaylists } from "@/lib/api";

export default function AddPlaylist() {
  const router = useRouter();
  const [hasPlaylists, setHasPlaylists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPlaylists = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const playlists = await getPlaylists(token);
        setHasPlaylists(playlists.length > 0);
      } catch (error) {
        console.error("Erreur lors de la vérification des playlists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPlaylists();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20">
      {!hasPlaylists ? (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <h2 className="text-2xl text-zinc-400/60 text-lg text-center">
            Vous n'avez toujours pas de playlist sur melosphere ?! 
          </h2>
          <Button 
            onClick={() => router.push('/playlists')}
            className="flex flex-col items-center gap-4 p-8 bg-transparent hover:bg-zinc-800/50 transition-all duration-300"
          >
            <span className="text-zinc-300 text-lg ">
             Créer une playlist +
            </span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <h2 className="text-2xl font-bold text-white">t'es cool</h2>
        </div>
      )}
    </div>
  );
}