"use client"; //bac à sable 1

import { DownloadCard } from "@/components/DownloadCard";
import { SearchBar } from "@/components/SearchBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAuth from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import AddPlaylist from "@/components/AddPlaylist";
import PlaylistCard from "@/components/PlaylistCard";
import { searchPlaylists, downloadPlaylist } from "@/lib/api";

export default function Home() {
  const { isLoading: authLoading } = useAuth();
  const [showPlaylistSelection, setShowPlaylistSelection] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      await downloadPlaylist(token, playlistId);
    } catch (err: any) {
      console.error('Erreur lors du téléchargement:', err);
      setError(err.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 pl-0 pt-0 h-screen"> 
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[400px]">
        <SearchBar 
            value={searchQuery}
            onChange={(e) => {
              console.log("Search input changed:", e.target.value); // Log pour déboguer
              setSearchQuery(e.target.value);
            }}
          />
        </div>
        
        {searchQuery ? (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Log pour déboguer */}
            {console.log("Rendering results:", searchResults)}
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
    </div>
    </ProtectedRoute>
  );
}
