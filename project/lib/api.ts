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

export const createPlaylist = async (token: string, name: string, description: string, links: string[], isPublic: boolean) => {
  const response = await fetch(`${API_URL}/playlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description, links, isPublic }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de la création de la playlist');
  }
  return data;
};

export const getPlaylists = async (token: string) => {
  const response = await fetch(`${API_URL}/getplaylists`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de la récupération des playlists');
  }
  return data;
};
export const deletePlaylist = async (token: string, playlistId: number) => {
  const response = await fetch(`${API_URL}/playlists/${playlistId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de la suppression de la playlist');
  }
  return data;
};

export const updatePlaylist = async (token: string, playlistId: number, data: {
  name: string,
  description: string,
  links: string[],
  isPublic: boolean
}) => {
  console.log("Envoi de la requête updatePlaylist:", {
    playlistId,
    data
  });

  const response = await fetch(`${API_URL}/updateplaylists/${playlistId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  console.log("Réponse updatePlaylist:", responseData);

  if (!response.ok) {
    throw new Error(responseData.message || 'Erreur lors de la modification de la playlist');
  }
  return responseData;
};

export const downloadPlaylist = async (token: string, playlistId: number) => {
  try {
    const response = await fetch(`${API_URL}/download-playlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ playlistId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du téléchargement de la playlist');
    }

    // Récupérer le nom du fichier depuis les headers
    const contentDisposition = response.headers.get('content-disposition');
    const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'playlist.zip';

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('[Download-Playlist] Erreur:', error);
    throw error;
  }
};

export const uploadProfilePicture = async (token: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload-profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Ne pas définir 'Content-Type', laisser le navigateur le définir automatiquement
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors du téléchargement de la photo de profil.');
  }

  return data;
};

export const getHistory = async (token: string) => {
  const response = await fetch(`${API_URL}/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de la récupération de l\'historique');
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

export const getUserProfile = async (token: string) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de la récupération du profil utilisateur');
  }
  return data;
};

export const updateUserEmail = async (token: string, email: string) => {
  const response = await fetch(`${API_URL}/update-email`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'email');
  }

  return response.json();
};

export const updateUserPassword = async (token: string, password: string, newPassword: string) => {
  const response = await fetch(`${API_URL}/update-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ password, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour du mot de passe');
  }

  return response.json();
};

export const deleteUserAccount = async (token: string) => {
  const response = await fetch(`${API_URL}/delete-account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression du compte');
  }

  return response.json();
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

export const handleDownloadAndSend = async (videoUrl: string, token: string) => {
  try {
    const downloadResponse = await fetch(`${API_URL}/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (!downloadResponse.ok) {
      const errorData = await downloadResponse.json();
      throw new Error(errorData.message || 'Erreur lors du téléchargement');
    }

    const data = await downloadResponse.json();
    
    // Une fois que le fichier est prêt, on le récupère
    const fileResponse = await fetch(`${API_URL}/send-file/${data.fileName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!fileResponse.ok) {
      throw new Error('Erreur lors de la récupération du fichier');
    }

    const blob = await fileResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return {
      ...data,
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0
    };
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};