"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAuth from "./hooks/useAuth";

async function handleDownloadAndSend(videoUrl: string, token: string) {
  try {
    // Télécharger le fichier
    const downloadResponse = await fetch("http://87.106.162.205:5001/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (!downloadResponse.ok) {
      const errorData = await downloadResponse.text(); // Lire la réponse comme texte pour éviter l'erreur JSON
      throw new Error(`Erreur serveur : ${errorData}`);
    }

    let jsonResponse;
    try {
      jsonResponse = await downloadResponse.json();
    } catch (error) {
      throw new Error("La réponse du serveur n'est pas valide.");
    }

    const { fileName } = jsonResponse;

    // Attendre que le fichier soit prêt, puis le récupérer
    const sendFileResponse = await fetch(`http://87.106.162.205:5001/api/send-file/${fileName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!sendFileResponse.ok) {
      throw new Error("Erreur lors de l'envoi du fichier.");
    }

    const blob = await sendFileResponse.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error: any) {
    console.error("Erreur :", error.message);
    throw error;
  }
}

export default function Home() {
  const { isLoading: authLoading } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDownloading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token manquant. Veuillez vous reconnecter.");
      }

      await handleDownloadAndSend(videoUrl, token);
    } catch (err: any) {
      setError(err.message || "Erreur lors du téléchargement.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Accueil</h1>
        <form onSubmit={handleSubmit}>
          <Input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Collez un lien YouTube ici..."
            className="bg-zinc-800/50 border-violet-500/20 text-white pr-12"
          />
          <Button type="submit" disabled={isDownloading || authLoading}>
            {isDownloading ? "Téléchargement en cours..." : "Télécharger"}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </main>
    </ProtectedRoute>
  );
}