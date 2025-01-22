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
        {/* SearchBar container */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[400px]">
          <SearchBar />
        </div>
        
        {/* Cards container with flex */}
        <div className="flex gap-6 mt-8">
          {/* DownloadCard container */}
          <div className="w-2/3">
            <DownloadCard authLoading={authLoading} />
          </div>
          {/* AddPlaylist container */}
          <div className="w-1/3">
            <AddPlaylist />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
