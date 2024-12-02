"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Download } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Playlist {
  id: string;
  name: string;
  description: string;
  links: string[];
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
    links: [""],
  });

  const addLink = () => {
    setNewPlaylist({
      ...newPlaylist,
      links: [...newPlaylist.links, ""],
    });
  };

  const createPlaylist = () => {
    if (newPlaylist.name && newPlaylist.links[0]) {
      setPlaylists([
        ...playlists,
        {
          id: Date.now().toString(),
          ...newPlaylist,
        },
      ]);
      setNewPlaylist({
        name: "",
        description: "",
        links: [""],
      });
    }
  };

  return (
    <ProtectedRoute>
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Playlists</h1>

      <div className="flex gap-8">
        <div className="w-96">
          <Card className="p-6 bg-zinc-900/50 border-violet-500/20 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Créer une playlist</h2>
            <div className="space-y-4">
              <Input
                placeholder="Nom de la playlist"
                value={newPlaylist.name}
                onChange={(e) =>
                  setNewPlaylist({ ...newPlaylist, name: e.target.value })
                }
                className="bg-zinc-800/50"
              />
              <Textarea
                placeholder="Description"
                value={newPlaylist.description}
                onChange={(e) =>
                  setNewPlaylist({ ...newPlaylist, description: e.target.value })
                }
                className="bg-zinc-800/50"
              />
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
              <div className="flex gap-4">
                <Button onClick={addLink} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un lien
                </Button>
                <Button onClick={createPlaylist} className="bg-violet-600 hover:bg-violet-700">
                  Créer la playlist
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="p-4 bg-zinc-900/50 border-violet-500/20">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{playlist.name}</h3>
                  <p className="text-zinc-400 text-sm mt-1">{playlist.description}</p>
                </div>
                <div className="space-y-2">
                  {playlist.links.map((link, index) => (
                    <p key={index} className="text-xs text-zinc-500 truncate">
                      {link}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                  <Button size="sm" variant="outline">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-violet-500">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}