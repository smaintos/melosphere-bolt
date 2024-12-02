// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de l\'inscription');
  }
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de la connexion');
  }
  return data;
};

export const getRoom = async (token: string) => {
  const response = await fetch(`${API_URL}/room`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de l\'accès à la salle');
  }
  return data;
};

/**
 * Fonction pour télécharger un fichier MP3 à partir d'une URL YouTube.
 * @param videoUrl - URL de la vidéo YouTube à convertir en MP3.
 * @param token - Token JWT pour l'authentification.
 * @returns La réponse de la requête pour gérer le téléchargement côté frontend.
 */
export const downloadMp3 = async (videoUrl: string, token: string) => {
  const encodedUrl = encodeURIComponent(videoUrl);
  const response = await fetch(`${API_URL}/downloadMp3?videoUrl=${encodedUrl}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur lors du téléchargement du MP3');
  }

  return response;
};
