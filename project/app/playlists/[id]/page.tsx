"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, ExternalLink, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPlaylists, downloadPlaylist } from "@/lib/api";

interface Playlist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  links: { url: string }[];
  user: {
    username: string;
  };
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token manquant');
        }
        
        const data = await getPlaylists(token);
        const playlistId = parseInt(params?.id as string);
        const foundPlaylist = data.find((p: Playlist) => p.id === playlistId);
        
        if (!foundPlaylist) {
          throw new Error('Playlist non trouvée');
        }
        
        setPlaylist(foundPlaylist);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [params]);

  const handleDownload = async () => {
    if (!playlist) return;
    
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      setDownloadError(false);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }
      
      await downloadPlaylist(token, playlist.id, (progress) => {
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

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !playlist) {
    return (
      <ProtectedRoute>
        <div className="flex-1 p-8">
          <Button 
            variant="ghost" 
            className="mb-8 text-violet-400"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <Card className="p-8 bg-zinc-900/90 border-violet-500/20">
            <h1 className="text-2xl font-bold text-red-500">Erreur</h1>
            <p className="text-zinc-400 mt-4">{error || "Impossible de trouver cette playlist"}</p>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 p-8">
        <Button 
          variant="ghost" 
          className="mb-8 text-violet-400"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>

        <div className="flex flex-col space-y-8">
          <Card className="p-8 bg-zinc-900/90 border-violet-500/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
                  <Badge 
                    variant={playlist.isPublic ? "default" : "secondary"}
                    className={playlist.isPublic ? "bg-violet-600" : "bg-zinc-600"}
                  >
                    {playlist.isPublic ? "Public" : "Privé"}
                  </Badge>
                </div>
                <p className="text-violet-400 text-sm">par {playlist.user.username}</p>
                <p className="text-zinc-400 mt-4">{playlist.description}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  className="text-violet-500 hover:text-violet-400"
                  onClick={handleDownload}
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-violet-500 hover:text-violet-400"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // Ici vous pourriez ajouter une notification pour indiquer que le lien a été copié
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4 mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">{playlist.links.length} vidéos</h2>
            {playlist.links.map((link, index) => {
              const videoId = getYoutubeVideoId(link.url);
              return (
                <Card key={index} className="p-4 bg-zinc-900/90 border-violet-500/20 hover:border-violet-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    {videoId ? (
                      <div className="w-32 h-20 overflow-hidden rounded-md bg-zinc-800 flex-shrink-0">
                        <img 
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt="Miniature vidéo"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-20 bg-zinc-800 rounded-md flex items-center justify-center flex-shrink-0">
                        <ExternalLink className="w-6 h-6 text-zinc-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white truncate">{link.url}</p>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-500 hover:text-violet-400 text-sm inline-flex items-center mt-2"
                      >
                        Ouvrir <ExternalLink className="ml-1 w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Overlay de téléchargement avec progression */}
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