// app/page.tsx

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAuth from "./hooks/useAuth";
import { downloadMp3 } from "@/lib/api";

export default function Home() {
  const { isLoading: authLoading } = useAuth(); // Gérer l'état de chargement de l'authentification
  const [videoUrl, setVideoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    // Réinitialiser les erreurs précédentes
    setError(null);

    // Validation basique de l'URL
    if (!videoUrl) {
      setError("Veuillez entrer une URL YouTube valide.");
      return;
    }

    // Vérification du format de l'URL YouTube
    const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(videoUrl)) {
      setError("Veuillez entrer une URL YouTube valide.");
      return;
    }

    setIsDownloading(true);

    try {
      // Récupérer le token JWT depuis le contexte d'authentification
      const token = localStorage.getItem("token") || "";
      if (!token) {
        setError("Token d'authentification manquant. Veuillez vous reconnecter.");
        setIsDownloading(false);
        return;
      }

      // Utiliser la fonction API pour télécharger le MP3
      const response = await downloadMp3(videoUrl, token);

      // Récupérer le nom du fichier depuis les en-têtes de la réponse
      const disposition = response.headers.get("Content-Disposition");
      let filename = "download.mp3";
      if (disposition && disposition.includes("filename=")) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Convertir la réponse en blob et créer une URL pour le téléchargement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Erreur lors du téléchargement du MP3 :", err);
      setError(err.message || "Erreur lors du téléchargement du MP3.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDownload();
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Accueil</h1>
        
        <div className="max-w-2xl mx-auto mt-12">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Input 
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Collez un lien YouTube ici..." 
                className="bg-zinc-800/50 border-violet-500/20 text-white pr-12"
              />
              <Button 
                type="submit"
                size="icon"
                className="absolute right-1 top-1 bg-violet-600 hover:bg-violet-700"
                disabled={isDownloading || authLoading}
              >
                {isDownloading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
          
          <div className="mt-16 text-center text-zinc-400">
            <p className="text-lg">Commencez par coller un lien YouTube</p>
            <p className="mt-2">Créez des playlists et partagez votre musique</p>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
