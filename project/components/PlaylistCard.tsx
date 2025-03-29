import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface PlaylistCardProps {
    playlist: {
      id: number;
      name: string;
      description: string;
      links: { url: string }[];
      coverImage?: string;
      isPublic?: boolean;
      user?: {
        username: string;
      };
    };
    onDownload: () => void;
  }
  
  export default function PlaylistCard({ playlist, onDownload }: PlaylistCardProps) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://87.106.162.205:5001';
    
    return (
      <Card className="bg-zinc-900 border border-zinc-800 overflow-hidden transition-all duration-300 group hover:bg-zinc-800/90 hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-900/20">
        {/* Image de couverture carrée */}
        <div className="w-full aspect-square overflow-hidden group-hover:opacity-90 transition-opacity">
          {playlist.coverImage ? (
            <Image
              src={`${apiUrl}/uploads/${playlist.coverImage}`}
              alt={playlist.name}
              width={300}
              height={300}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <ImageIcon className="w-14 h-14 text-zinc-700" />
            </div>
          )}
        </div>

        {/* Contenu texte en dessous de l'image */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-white line-clamp-1 mb-1">{playlist.name}</h3>
          <p className="text-xs text-zinc-400 mb-3 line-clamp-1">
            {playlist.user ? `par ${playlist.user.username}` : "par utilisateur inconnu"}
          </p>
          
          <div className="flex justify-between items-center">
            {/* Badge de visibilité */}
            {playlist.isPublic !== undefined && (
              <Badge 
                variant={playlist.isPublic ? "default" : "secondary"}
                className={`text-xs px-2 py-0.5 ${playlist.isPublic ? "bg-violet-600 hover:bg-violet-700" : "bg-zinc-700 hover:bg-zinc-600"}`}
              >
                {playlist.isPublic ? "Public" : "Privé"}
              </Badge>
            )}
            
            {/* Nombre de titres */}
            <p className="text-xs text-zinc-500">
              {playlist.links.length} {playlist.links.length > 1 ? "titres" : "titre"}
            </p>
          </div>
        </div>
      </Card>
    );
  }