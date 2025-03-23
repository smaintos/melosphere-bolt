'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil, Download } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EditPlaylistModal } from '@/components/EditPlaylistModal';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { createPlaylist, getPlaylists, deletePlaylist, updatePlaylist, downloadPlaylist } from '@/lib/api';

interface Link {
  id: number;
  url: string;
  title?: string;
  channel?: string;
  playlistId: number;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  links: Link[];
  isPublic: boolean;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    links: [''],
    isPublic: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token manquant');
        }
        const data = await getPlaylists(token);
        setPlaylists(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const addLink = () => {
    setNewPlaylist({
      ...newPlaylist,
      links: [...newPlaylist.links, ''],
    });
  };

  const handleCreatePlaylist = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token manquant');

      const validLinks = newPlaylist.links.filter(link => link.trim() !== '');
      if (validLinks.length === 0) throw new Error('Ajoutez au moins un lien valide');

      const playlist = await createPlaylist(
        token,
        newPlaylist.name,
        newPlaylist.description,
        validLinks,
        newPlaylist.isPublic
      );

      setPlaylists(prevPlaylists => [...prevPlaylists, playlist]);
      setNewPlaylist({ name: '', description: '', links: [''], isPublic: false });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      await deletePlaylist(token, playlistId);
      setPlaylists(prevPlaylists => prevPlaylists.filter(p => p.id !== playlistId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdatePlaylist = async (playlistId: number, data: { name: string; description: string; links: string[]; isPublic: boolean }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      const updatedPlaylist = await updatePlaylist(token, playlistId, data);
      setPlaylists(prevPlaylists =>
        prevPlaylists.map(p => p.id === playlistId ? updatedPlaylist : p)
      );
      setEditingPlaylist(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  if (isLoading) {
    return <div className="text-white">Chargement des playlists...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Playlists</h1>
  
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulaire de création */}
          <div className="w-full lg:w-96">
            <Card className="p-6 bg-zinc-900/50 border-violet-500/20 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Créer une playlist</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Nom de la playlist"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="bg-zinc-800/50"
                />
                <Textarea
                  placeholder="Description"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="bg-zinc-800/50"
                />
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-zinc-400">Visibilité:</label>
                  <select
                    value={newPlaylist.isPublic ? "public" : "private"}
                    onChange={(e) => setNewPlaylist({
                      ...newPlaylist,
                      isPublic: e.target.value === "public"
                    })}
                    className="bg-black border-violet-500/20 rounded-md p-2 text-sm text-white"
                  >
                    <option value="private" className="bg-black text-white">Privée</option>
                    <option value="public" className="bg-black text-white">Publique</option>
                  </select>
                </div>
                
                {/* Container avec scrollbar pour les liens */}
                <div className="space-y-4">
                  <ScrollArea className={`${newPlaylist.links.length > 3 ? 'h-48' : ''} w-full`}>
                    <div className="space-y-4 pr-6 pb-2 pl-1 pt-1">
                      {newPlaylist.links.map((link, index) => (
                        <Input
                          key={index}
                          placeholder="Lien YouTube"
                          value={link}
                          onChange={(e) => {
                            const newLinks = [...newPlaylist.links];
                            newLinks[index] = e.target.value;
                            setNewPlaylist({ ...newPlaylist, links: newLinks });
                          }}
                          className="bg-zinc-800/50"
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={addLink} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un lien
                  </Button>
                  <Button onClick={handleCreatePlaylist} className="bg-violet-600 hover:bg-violet-700">
                    Créer la playlist
                  </Button>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
              </div>
            </Card>
          </div>
  
          {/* Container des playlists */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4 rounded-lg bg-zinc-900/50 border border-violet-500/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {playlists.length === 0 ? (
                  <p className="text-zinc-400">Aucune playlist créée</p>
                ) : (
                  playlists.map((playlist) => (
                    <Card key={playlist.id} className="h-[300px] p-4 bg-zinc-800 rounded-lg relative border border-zinc-700/50 hover:border-violet-500/50 hover:shadow-[0_0_57px_rgba(139,92,246,0.2)] transition-all duration-300">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
                            <Badge 
                              variant={playlist.isPublic ? "default" : "secondary"}
                              className={playlist.isPublic ? "bg-violet-600" : "bg-zinc-600"}
                            >
                              {playlist.isPublic ? "Public" : "Privé"}
                            </Badge>
                          </div>
                          <div className="h-[50px] mb-2 overflow-hidden">
                            <p className="text-zinc-400 text-sm line-clamp-2">{playlist.description}</p>
                          </div>
                          <ScrollArea className="h-[120px]">
                            <div className="space-y-2">
                              {playlist.links.map((link, index) => (
                                <p
                                  key={index}
                                  className="text-xs text-zinc-500 truncate hover:text-zinc-300 transition-colors"
                                >
                                  {link.title ? `${link.title} - ${link.channel}` : link.url}
                                </p>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                        
                        <div className="flex justify-center gap-2 pt-4 mt-auto border-t border-zinc-700/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPlaylist(playlist)}
                            className="group relative"
                          >
                            <Pencil className="w-5 h-5" />
                            <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              Modifier
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-700 hover:bg-green-500/10 group relative"
                            onClick={() => handleDownloadPlaylist(playlist.id)}
                          >
                            <Download className="w-5 h-5" />
                            <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              Télécharger
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 group relative"
                            onClick={() => handleDeletePlaylist(playlist.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              Supprimer
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
  
        {editingPlaylist && (
          <EditPlaylistModal
            playlist={editingPlaylist}
            onClose={() => setEditingPlaylist(null)}
            onUpdate={handleUpdatePlaylist}
          />
        )}

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