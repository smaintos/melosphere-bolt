import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import ImageCropper from '@/components/ui/ImageCropper';

interface EditPlaylistModalProps {
  playlist: {
    id: number;
    name: string;
    description: string;
    links: { url: string }[];
    isPublic: boolean;
    coverImage?: string;
  };
  onClose: () => void;
  onUpdate: (playlistId: number, data: { 
    name: string; 
    description: string; 
    links: string[];
    isPublic: boolean;
    coverImage?: File;
  }) => void;
}

export function EditPlaylistModal({ playlist, onClose, onUpdate }: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description);
  const [links, setLinks] = useState(playlist.links.map(link => link.url));
  const [isPublic, setIsPublic] = useState(playlist.isPublic);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    playlist.coverImage 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://87.106.162.205:5001'}/uploads/${playlist.coverImage}`
      : null
  );
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCoverImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      console.log("Fichier image sélectionné pour édition:", file.name);
      setTempImageFile(file);
      setShowCropper(true);
      
      // Réinitialiser le champ file input
      e.target.value = '';
    }
  }, []);

  const handleCropComplete = useCallback((croppedFile: File) => {
    console.log("Recadrage terminé pour l'édition, création de l'aperçu");
    setCoverImage(croppedFile);
    
    // Créer un aperçu de l'image recadrée
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    
    setShowCropper(false);
    setTempImageFile(null);
  }, []);

  const handleCancelCrop = useCallback(() => {
    setShowCropper(false);
    setTempImageFile(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom de la playlist est requis');
      return;
    }
    
    try {
      setIsSubmitting(true);
      onUpdate(playlist.id, {
        name,
        description,
        links: links.filter(link => link.trim() !== ''),
        isPublic,
        coverImage: coverImage || undefined
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLink = () => {
    setLinks([...links, '']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-auto z-10 h-[90vh] overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <h2 className="text-xl font-semibold mb-4">Modifier la playlist</h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="overflow-y-auto h-[calc(100%-6rem)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nom de la playlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800/50"
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-800/50"
            />

            {/* Sélecteur d'image de couverture */}
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
                    <span className="text-sm text-zinc-300">
                      {playlist.coverImage ? 'Changer l&apos;image' : 'Télécharger'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </label>
                  {(coverImagePreview || playlist.coverImage) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-zinc-300"
                      onClick={() => {
                        setCoverImage(null);
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
                value={isPublic ? "public" : "private"}
                onChange={(e) => setIsPublic(e.target.value === "public")}
                className="bg-zinc-800/50 border-violet-500/20 rounded-md p-2 text-sm"
              >
                <option value="private">Privée</option>
                <option value="public">Publique</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Liens:</p>
              {links.map((link, index) => (
                <Input
                  key={index}
                  placeholder="Lien YouTube"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = e.target.value;
                    setLinks(newLinks);
                  }}
                  className="bg-zinc-800/50"
                />
              ))}
              <Button
                type="button"
                onClick={addLink}
                variant="outline"
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un lien
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Enregistrement...
                  </div>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </div>
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