"use client";

import { DownloadCard } from "@/components/DownloadCard";
import { SearchBar } from "@/components/SearchBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAuth from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import AddPlaylist from "@/components/AddPlaylist";
import PlaylistCard from "@/components/PlaylistCard";
import { searchPlaylists, downloadPlaylist } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Créer une référence globale pour accéder à la fonction de réinitialisation de recherche
declare global {
  interface Window {
    resetSearch?: () => void;
  }
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  links: { url: string }[];
  isPublic: boolean;
  user: {
    username: string;
  };
}

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [showPlaylistSelection, setShowPlaylistSelection] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // État pour le loader global

  // Vérifier si l'utilisateur est connecté, sinon rediriger vers /accueil
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/accueil');
      } else {
        // Uniquement si l'utilisateur est authentifié, on masque le loader
        setTimeout(() => {
          setIsPageLoading(false);
        }, 200); // Petit délai pour assurer la transition
      }
    }
  }, [user, authLoading, router]);

  // Réinitialiser la recherche (accessible globalement)
  const resetSearch = () => {
    setSearchQuery('');
    localStorage.setItem('searchQuery', '');
  };

  // Exposer la fonction globalement pour que la sidebar puisse l'utiliser
  useEffect(() => {
    window.resetSearch = resetSearch;
    
    return () => {
      window.resetSearch = undefined;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Récupérer la recherche du localStorage au chargement initial
  useEffect(() => {
    const storedSearch = localStorage.getItem('searchQuery') || '';
    setSearchQuery(storedSearch);
  }, []);

  // Sauvegarder la recherche dans le localStorage quand elle change
  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    console.log("Search Query:", searchQuery); 
    const searchPlaylistsData = async () => {
      if (searchQuery.length > 0) {
        const token = localStorage.getItem('token');
        if (!token) return;
  
        try {
          console.log("Fetching results for:", searchQuery);

          const results = await searchPlaylists(token, searchQuery);
          setSearchResults(results);
          console.log("Results received:", results);

        } catch (error) {
          console.error('Erreur de recherche:', error);
        }
      } else {
        setSearchResults([]);
      }
    };
  
    const debounce = setTimeout(() => {
      searchPlaylistsData();
    }, 300);
  
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleDownloadPlaylist = async (playlistId: number) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      setDownloadError(false);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      await downloadPlaylist(token, playlistId, (progress) => {
        setDownloadProgress(progress);
        if (progress === 100) {
          // Garder le message "Téléchargement terminé" pendant 1 seconde avant de fermer
          setTimeout(() => {
            setIsDownloading(false);
          }, 1000);
        }
      });
    } catch (err: any) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Il y\'a un probleme avec votre fichier');
      setDownloadError(true);
      // On garde l'état isDownloading à true pour afficher le message d'erreur
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search input changed:", e.target.value);
    setSearchQuery(e.target.value);
  };

  // Si la page est en cours de chargement ou l'authentification est en cours, afficher le loader
  if (isPageLoading || authLoading) {
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
          <p className="text-zinc-400 mt-2">Préparation de Melosphere</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 pl-0 pt-0 h-screen"> 
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[400px]">
        <SearchBar 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        {searchQuery ? (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {searchResults.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onDownload={() => handleDownloadPlaylist(playlist.id)}
              />
            ))}
          </div>
        ) : (
        
        <div className="flex gap-6 mt-8">
          <div className="w-2/3">
            <DownloadCard 
              authLoading={authLoading}
              onAddToPlaylist={(url) => {
                setCurrentVideoUrl(url);
                setShowPlaylistSelection(true);
              }}
            />
          </div>
          <div className="w-1/3">
          <AddPlaylist 
              showCheckboxes={showPlaylistSelection}
              videoUrl={currentVideoUrl} // Vérifier que cette URL arrive bien
              onPlaylistSelect={() => {
                console.log("Playlist sélectionnée et mise à jour"); // Pour debug
                setShowPlaylistSelection(false);
                setCurrentVideoUrl("");
              }}
            />
          </div>
        </div>
        )}

        {/* Overlay de téléchargement avec progression ou message d'erreur */}
        {isDownloading && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-8 rounded-xl w-96 shadow-xl border border-violet-500/20">
              {downloadError ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-zinc-800">
                    <svg className="w-10 h-10 text-zinc-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl text-center text-white mb-4">
                    Il y&apos;a un probleme avec votre fichier
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    Cela peut arriver, cette erreur sera réparée dans la v.2 de Melosphere
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    onClick={() => {
                      setIsDownloading(false);
                      setDownloadError(false);
                    }}
                  >
                    Fermer
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl text-center text-white mb-6">
                    {downloadProgress < 100 ? "Téléchargement en cours..." : "Téléchargement terminé !"}
                  </h3>
                  
                  <div className="w-full bg-zinc-800 rounded-full h-4 mb-6">
                    <div 
                      className="bg-violet-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-center text-lg text-violet-400 font-medium">{downloadProgress}%</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
