"use client";

import { DownloadCard } from "@/components/DownloadCard";
import { SearchBar } from "@/components/SearchBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAuth from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import AddPlaylist from "@/components/AddPlaylist";

export default function Home() {
  const { isLoading: authLoading } = useAuth();
  const [showPlaylistSelection, setShowPlaylistSelection] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");



  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex-1 pl-0 pt-0 h-screen"> 
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[400px]">
          <SearchBar />
        </div>
        
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
      </div>
    </ProtectedRoute>
  );
}