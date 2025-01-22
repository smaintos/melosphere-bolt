import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface EditPlaylistModalProps {
  playlist: {
    id: number;
    name: string;
    description: string;
    links: { url: string }[];
  };
  onClose: () => void;
  onUpdate: (playlistId: number, data: { name: string; description: string; links: string[] }) => void;
}

export function EditPlaylistModal({ playlist, onClose, onUpdate }: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description);
  const [links, setLinks] = useState(playlist.links.map(link => link.url));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(playlist.id, {
      name,
      description,
      links: links.filter(link => link.trim() !== '')
    });
  };

  const addLink = () => {
    setLinks([...links, '']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg p-6 bg-zinc-900 rounded-lg shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <h2 className="text-xl font-semibold mb-4">Modifier la playlist</h2>

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
          <div className="flex gap-4">
            <Button type="button" onClick={addLink} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un lien
            </Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              Mettre à jour
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}