import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress"; 
import { useState } from "react";
import { handleDownloadAndSend } from "@/lib/api";
import { Heart, Eye } from "lucide-react";


interface VideoInfo {
  title: string;
  channel: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  url: string; 
}


interface DownloadCardProps {
  authLoading: boolean;
  onAddToPlaylist: (url: string) => void;
}

export function DownloadCard({ authLoading, onAddToPlaylist }: DownloadCardProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDownloading(true);
    setVideoInfo(null);
    setProgress(0);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token manquant. Veuillez vous reconnecter.");
      }

      // Simuler une progression
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await handleDownloadAndSend(videoUrl, token);
      setVideoInfo({
        title: response.title,
        channel: response.channel,
        thumbnail: response.thumbnail,
        viewCount: response.viewCount,
        likeCount: response.likeCount,
        url: videoUrl
      });
      setVideoUrl("");
      setProgress(100);
      clearInterval(progressInterval);

    } catch (err: any) {
      setError(err.message || "Erreur lors du téléchargement.");
      setProgress(0);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-zinc-900/90 h-[600px] sm:h-[850px] md:h-[780px] rounded-xl p-8 backdrop-blur-sm border border-violet-500/20">
      <div className="relative">
        <form onSubmit={handleSubmit}>
          <Input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Collez un lien YouTube ici..."
            className="bg-zinc-800/50 border-violet-500/20 text-white pr-20 h-14 text-lg rounded-xl"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isDownloading || authLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700 p-2 rounded-lg"
          >
            <img 
              src="https://img.icons8.com/?size=100&id=3685&format=png" 
              alt="download"
              className="w-6 h-6 invert"
            />
          </Button>
        </form>
      </div>

      {videoInfo && (
        <div className="mt-6 space-y-6">
          <div className="w-full h-[500px] rounded-lg overflow-hidden bg-zinc-800/50">
            <img 
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white truncate max-w-[60%]">
                {videoInfo.title}
              </h3>
              <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => videoInfo && onAddToPlaylist(videoInfo.url)}
                variant="ghost"
                className="text-violet-500 hover:text-violet-400"
              >
                Ajouter à une playlist +
              </Button>
              </div>
            </div>
            <p className="text-violet-400 text-lg font-medium">
              {videoInfo.channel}
            </p>
            <div className="flex space-x-6 text-base text-zinc-400 font-medium ml-[830px]">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{(videoInfo.viewCount || 0).toLocaleString()} vues</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>{(videoInfo.likeCount || 0).toLocaleString()} likes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDownloading && (
        <div className="absolute bottom-8 left-8 right-8 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-zinc-400 text-center">
            Téléchargement en cours... {progress}%
          </p>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}