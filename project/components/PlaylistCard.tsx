import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react";

interface PlaylistCardProps {
    playlist: {
      id: number;
      name: string;
      description: string;
      links: { url: string }[];
      user: {
        username: string;
      };
    };
    onDownload: () => void;
  }
  
  export default function PlaylistCard({ playlist, onDownload }: PlaylistCardProps) {
    return (
      <Card className="bg-zinc-900/90 p-6 border-violet-500/20">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
              <p className="text-sm text-violet-400">par {playlist.user.username}</p>
              <p className="text-zinc-400 text-sm mt-2">{playlist.description}</p>
            </div>
            <Button
              onClick={onDownload}
              variant="ghost"
              className="text-violet-500 hover:text-violet-400"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">{playlist.links.length} titres</p>
          </div>
        </div>
      </Card>
    );
  }