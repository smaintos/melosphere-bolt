"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPlaylists, updatePlaylist, createPlaylist } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import ImageCropper from "@/components/ui/ImageCropper";

interface Playlist {
  id: number;
  name: string;
  description: string;
  links: { url: string }[];
  isPublic: boolean;
  coverImage?: string;
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    
    // États pour la création de nouvelle playlist
    const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({
      name: '',
      description: '',
      links: [''],
      isPublic: false,
      coverImage: null as File | null
    });
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tempImageFile, setTempImageFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
  
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
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaylistClick = (event: React.MouseEvent) => {
    // Ne pas naviguer si on est en mode sélection ou si on clique sur la checkbox
    if (showCheckboxes || (event.target as HTMLElement).closest('.checkbox-container')) {
      return;
    }
    router.push('/playlists');
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier que le fichier est une image
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image est trop volumineuse (max 5MB)');
        return;
      }
      
      console.log("Fichier image sélectionné:", file.name);
      setTempImageFile(file);
      setShowCropper(true);
      
      // Réinitialiser le champ file input
      e.target.value = '';
    }
  }, []);

  const handleCropComplete = useCallback((croppedFile: File) => {
    console.log("Recadrage terminé, création de l'aperçu");
    setNewPlaylist(prev => ({ ...prev, coverImage: croppedFile }));
    
    // Créer l'aperçu de l'image recadrée
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    
    setShowCropper(false);
    setTempImageFile(null);
  }, []);

  const handleCreatePlaylist = async () => {
    setError(null);
    
    if (!newPlaylist.name.trim()) {
      setError('Le nom de la playlist est requis');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token manquant');

      const validLinks = newPlaylist.links.filter(link => link.trim() !== '');
      if (validLinks.length === 0 && !videoUrl) throw new Error('Ajoutez au moins un lien valide');

      // Si nous avons une URL vidéo (depuis le composant parent), ajoutez-la
      const linksToUse = videoUrl 
        ? [...validLinks, videoUrl] 
        : validLinks;

      console.log("Création de playlist avec image:", !!newPlaylist.coverImage);
      
      const playlist = await createPlaylist(
        token,
        newPlaylist.name,
        newPlaylist.description,
        linksToUse,
        newPlaylist.isPublic,
        newPlaylist.coverImage || undefined
      );

      setPlaylists(prevPlaylists => [...prevPlaylists, playlist]);
      setNewPlaylist({ name: '', description: '', links: [''], isPublic: false, coverImage: null });
      setCoverImagePreview(null);
      setShowNewPlaylistForm(false);
      
      // Si nous sommes en mode sélection, sélectionnez automatiquement la playlist créée
      if (showCheckboxes && videoUrl) {
        setSelectedPlaylistId(playlist.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCrop = useCallback(() => {
    setShowCropper(false);
    setTempImageFile(null);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  // Formulaire de création de playlist
  if (showNewPlaylistForm) {
    return (
      <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-white">Créer une playlist</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowNewPlaylistForm(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

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

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 block">Image de couverture (optionnelle):</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-md bg-zinc-800/70 flex items-center justify-center overflow-hidden">
                {coverImagePreview ? (
                  <Image
                    src={coverImagePreview}
                    alt="Aperçu"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-zinc-300">Télécharger</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {coverImagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-zinc-300"
                    onClick={() => {
                      setNewPlaylist({ ...newPlaylist, coverImage: null });
                      setCoverImagePreview(null);
                    }}
                  >
                    Supprimer l&apos;image
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-zinc-400">Visibilité:</label>
            <select
              value={newPlaylist.isPublic ? "public" : "private"}
              onChange={(e) => setNewPlaylist({
                ...newPlaylist,
                isPublic: e.target.value === "public"
              })}
              className="bg-zinc-800/50 border-violet-500/20 rounded-md p-2 text-sm"
            >
              <option value="private">Privée</option>
              <option value="public">Publique</option>
            </select>
          </div>

          {!videoUrl && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Liens:</p>
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
              <Button
                type="button"
                onClick={() => setNewPlaylist({
                  ...newPlaylist,
                  links: [...newPlaylist.links, '']
                })}
                variant="outline"
                className="w-full border-dashed"
              >
                Ajouter un lien +
              </Button>
            </div>
          )}

          <Button
            onClick={handleCreatePlaylist}
            className="w-full bg-violet-600 hover:bg-violet-700 mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Création...
              </div>
            ) : (
              "Créer la playlist"
            )}
          </Button>
        </div>

        {/* Composant de recadrage */}
        {showCropper && tempImageFile && (
          <ImageCropper
            imageFile={tempImageFile}
            onCropComplete={handleCropComplete}
            onCancel={handleCancelCrop}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20">
      <h1 className="text-2xl text-white mb-6">Playlists</h1>
      {!hasPlaylists ? (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <h2 className="text-zinc-400/60 text-lg text-center">
            Vous n&apos;avez toujours pas de playlist sur melosphere ?!
          </h2>
          <Button 
            onClick={() => setShowNewPlaylistForm(true)}
            className="flex flex-col items-center gap-4 p-8 bg-transparent hover:bg-zinc-800/50 transition-all duration-300"
          >
            <span className="text-zinc-300 text-lg">
              Créer une playlist +
            </span>
          </Button>
        </div>
      ) : (
        <>
          {showCheckboxes && (
            <Button
              onClick={() => setShowNewPlaylistForm(true)}
              className="w-full mb-4 bg-transparent border border-violet-500/20 hover:bg-zinc-800/50 transition-all duration-300"
            >
              Créer une nouvelle playlist +
            </Button>
          )}
          
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-4 pr-4">
              {playlists.map((playlist) => (
                <div 
                  key={playlist.id} 
                  className={`flex items-center gap-4 p-4 bg-zinc-800 rounded-lg relative border border-zinc-700/50 hover:border-violet-500/30 transition-all duration-300 ${!showCheckboxes ? 'cursor-pointer hover:bg-zinc-700/80' : ''}`}
                  onClick={(e) => handlePlaylistClick(e)}
                >
                  {showCheckboxes && (
                    <div className="checkbox-container">
                      <Checkbox
                        checked={selectedPlaylistId === playlist.id}
                        onCheckedChange={() => setSelectedPlaylistId(playlist.id)}
                        className="border-violet-500/30 data-[state=checked]:bg-violet-600"
                      />
                    </div>
                  )}
                  
                  {/* Image de couverture plus élégante */}
                  <div className="w-14 h-14 relative rounded-md overflow-hidden flex-shrink-0 border border-zinc-700/50 group-hover:border-violet-500/20">
                    {playlist.coverImage ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://87.106.162.205:5001'}/uploads/${playlist.coverImage}`}
                        alt={playlist.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <ImageIcon className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>
  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-zinc-200 font-medium">{playlist.name}</h3>
                      <Badge 
                        variant={playlist.isPublic ? "default" : "secondary"}
                        className={playlist.isPublic ? "bg-violet-600" : "bg-zinc-600"}
                      >
                        {playlist.isPublic ? "Public" : "Privé"}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-1">{playlist.description}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      {playlist.links.length} {playlist.links.length > 1 ? "vidéos" : "vidéo"}
                    </p>
                  </div>
                </div>
              ))}
  
              {/* Bouton Ajouter à la playlist */}
              {showCheckboxes && selectedPlaylistId && (
                <div className="mt-6">
                  <Button
                    onClick={handleAddToPlaylist}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        Ajout en cours...
                      </div>
                    ) : (
                      "Ajouter à la playlist"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}