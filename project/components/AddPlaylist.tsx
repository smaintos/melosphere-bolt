"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPlaylists, updatePlaylist } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Playlist {
  id: number;
  name: string;
  description: string;
  links: { url: string }[];
  isPublic: boolean;
}

interface AddPlaylistProps {
  showCheckboxes?: boolean;
  videoUrl?: string;
  onPlaylistSelect?: () => void;
}

export default function AddPlaylist({ showCheckboxes = false, videoUrl, onPlaylistSelect }: AddPlaylistProps) {
    const router = useRouter();
    const [hasPlaylists, setHasPlaylists] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
    useEffect(() => {
      const checkPlaylists = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          
          const playlists = await getPlaylists(token);
          setHasPlaylists(playlists.length > 0);
          setPlaylists(playlists);
        } catch (error) {
          console.error("Erreur lors de la vérification des playlists:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      checkPlaylists();
    }, []);

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId || !videoUrl) {
      console.log("Données manquantes:", { selectedPlaylistId, videoUrl });
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const playlist = playlists.find(p => p.id === selectedPlaylistId);
      if (!playlist) {
        console.log("Playlist non trouvée");
        return;
      }

      console.log("Données avant requête:", {
        playlistId: selectedPlaylistId,
        currentLinks: playlist.links,
        newVideoUrl: videoUrl
      });

      // Mettre à jour la playlist avec le nouveau lien
      const updatedPlaylist = await updatePlaylist(token, selectedPlaylistId, {
        name: playlist.name,
        description: playlist.description,
        links: [...playlist.links.map(l => l.url), videoUrl],
        isPublic: playlist.isPublic
      });

      console.log("Playlist mise à jour:", updatedPlaylist);

      // Mettre à jour l'état local
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(p => 
          p.id === selectedPlaylistId ? updatedPlaylist : p
        )
      );

      setSelectedPlaylistId(null);
      if (onPlaylistSelect) onPlaylistSelect();

    } catch (error) {
      console.error("Erreur lors de l'ajout à la playlist:", error);
    }

    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const playlist = playlists.find(p => p.id === selectedPlaylistId);
      if (!playlist) return;

      await updatePlaylist(token, selectedPlaylistId, {
        name: playlist.name,
        description: playlist.description,
        links: [...playlist.links.map(l => l.url), videoUrl],
        isPublic: playlist.isPublic
      });

      setSelectedPlaylistId(null);
      if (onPlaylistSelect) onPlaylistSelect();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20">
      <h1 className="text-2xl text-white mb-6">Playlists</h1>
      {!hasPlaylists ? (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <h2 className="text-2xl text-zinc-400/60 text-lg text-center">
            Vous n'avez toujours pas de playlist sur melosphere ?!
          </h2>
          <Button 
            onClick={() => router.push('/playlists')}
            className="flex flex-col items-center gap-4 p-8 bg-transparent hover:bg-zinc-800/50 transition-all duration-300"
          >
            <span className="text-zinc-300 text-lg">
              Créer une playlist +
            </span>
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[600px] w-[550px]">
          <div className="space-y-4 pr-4">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id} 
                className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg relative border border-zinc-700/50 hover:border-violet-500/50 hover:shadow-[0_0_57px_rgba(139,92,246,0.2)] transition-all duration-300"
                >
                {showCheckboxes && (
                  <Checkbox
                    checked={selectedPlaylistId === playlist.id}
                    onCheckedChange={() => setSelectedPlaylistId(playlist.id)}
                    className="border-violet-500/20 data-[state=checked]:bg-violet-500"
                  />
                )}
                <div className="flex-1">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">{playlist.name}</h3>
                      <Badge 
                        variant={playlist.isPublic ? "default" : "secondary"}
                        className={`${playlist.isPublic ? "bg-violet-600" : "bg-zinc-600"} absolute top-2 right-2`}
                      >
                        {playlist.isPublic ? "Public" : "Privé"}
                      </Badge>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">{playlist.description}</p>
                    <span className="text-zinc-500 text-xs mt-2">
                      {playlist.links.length} {playlist.links.length > 1 ? "titres" : "titre"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showCheckboxes && selectedPlaylistId && (
            <Button 
              onClick={handleAddToPlaylist}
              className="mt-4 w-full bg-violet-600 hover:bg-violet-700"
            >
              Ajouter à la playlist
            </Button>
          )}
        </ScrollArea>
      )}
    </div>
  );
}