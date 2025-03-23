// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SearchPlaylist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  links: { url: string }[];
  user: {
    username: string;
  };
}

// Définition du type User
export type User = {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
};

export const registerUser = async (
  username: string, 
  email: string, 
  password: string, 
  secretQuestion: string, 
  secretAnswer: string
) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, secretQuestion, secretAnswer }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de l\'inscription');
  }
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/login`, {
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
  const response = await fetch(`${API_URL}/api/playlists`, {
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
  const response = await fetch(`${API_URL}/api/getplaylists`, {
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
  const response = await fetch(`${API_URL}/api/playlists/${playlistId}`, {
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

export const searchPlaylists = async (token: string, query: string): Promise<SearchPlaylist[]> => {
  // Log pour déboguer
  console.log("Calling API with query:", query);
  
  const response = await fetch(`${API_URL}/api/search/playlists?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Log pour déboguer
  console.log("API Response:", response);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de la recherche des playlists');
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

  const response = await fetch(`${API_URL}/api/updateplaylists/${playlistId}`, {
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

export const downloadPlaylist = async (token: string, playlistId: number, onProgress?: (progress: number) => void) => {
  try {
    // Simuler une progression avant de commencer le téléchargement réel
    if (onProgress) {
      // Simulation de progression
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 95) {
          progress = 95; // On garde 5% pour la fin du téléchargement
          clearInterval(interval);
        }
        onProgress(Math.min(Math.floor(progress), 95));
      }, 300);

      // Nettoyer l'intervalle à la fin
      const cleanup = () => clearInterval(interval);
      
      // Effectuer le téléchargement réel
      const response = await fetch(`${API_URL}/api/download-playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ playlistId }),
      });

      // Nettoyer l'intervalle
      cleanup();
      
      if (!response.ok) {
        // Conserver le message personnalisé qui correspond à notre interface
        throw new Error('Il y\'a un probleme avec votre fichier');
      }
      
      // Terminer la progression à 100%
      onProgress(100);

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
    } else {
      // Version classique sans progression
      const response = await fetch(`${API_URL}/api/download-playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ playlistId }),
      });

      if (!response.ok) {
        // Conserver le message personnalisé qui correspond à notre interface
        throw new Error('Il y\'a un probleme avec votre fichier');
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
    }
  } catch (error: any) {
    console.error('[Download-Playlist] Erreur:', error);
    // Si l'erreur n'a pas de message personnalisé, on en définit un par défaut
    if (error.message !== 'Il y\'a un probleme avec votre fichier') {
      throw new Error('Il y\'a un probleme avec votre fichier');
    }
    throw error;
  }
};

export const uploadProfilePicture = async (token: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload-profile-picture`, {
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
  const response = await fetch(`${API_URL}/api/history`, {
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
  const response = await fetch(`${API_URL}/api/room`, {
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
  const response = await fetch(`${API_URL}/api/profile`, {
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

export const getUserStats = async (token: string) => {
  try {
    // Récupérer l'historique pour compter les téléchargements
    const historyResponse = await fetch(`${API_URL}/api/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!historyResponse.ok) {
      throw new Error('Erreur lors de la récupération de l\'historique');
    }

    const history = await historyResponse.json();
    
    // Récupérer les détails du profil pour la date de création
    const profileResponse = await fetch(`${API_URL}/api/profile-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Erreur lors de la récupération des statistiques du profil');
    }

    const profileStats = await profileResponse.json();
    
    return {
      downloadsCount: history.length,
      createdAt: profileStats.createdAt,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      downloadsCount: 0,
      createdAt: null,
    };
  }
};

export const updateUserEmail = async (token: string, email: string) => {
  const response = await fetch(`${API_URL}/api/update-email`, {
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
  const response = await fetch(`${API_URL}/api/update-password`, {
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
  const response = await fetch(`${API_URL}/api/delete-account`, {
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
  const response = await fetch(`${API_URL}/api/downloadMp3?videoUrl=${encodedUrl}`, {
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
    const downloadResponse = await fetch(`${API_URL}/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (!downloadResponse.ok) {
      throw new Error('Il y\'a un probleme avec votre fichier');
    }

    const data = await downloadResponse.json();
    
    // Une fois que le fichier est prêt, on le récupère
    const fileResponse = await fetch(`${API_URL}/api/send-file/${data.fileName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!fileResponse.ok) {
      throw new Error('Il y\'a un probleme avec votre fichier');
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
  } catch (error: any) {
    console.error('[Download-Send] Erreur:', error);
    if (error.message !== 'Il y\'a un probleme avec votre fichier') {
      throw new Error('Il y\'a un probleme avec votre fichier');
    }
    throw error;
  }
};

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Une erreur est survenue lors de la demande de réinitialisation du mot de passe');
  }

  return response.json();
}

export async function sendFeedback(email: string, type: string, message: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Envoi de feedback:', { email, type, messageLength: message.length });
    
    const response = await fetch(`${API_URL}/api/send-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, type, message }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erreur lors de l\'envoi du feedback:', data);
      throw new Error(data.message || 'Une erreur est survenue lors de l\'envoi du feedback');
    }

    console.log('Feedback envoyé avec succès:', data);
    return data;
  } catch (error: any) {
    console.error('Exception lors de l\'envoi du feedback:', error);
    throw new Error(error.message || 'Une erreur est survenue lors de l\'envoi du feedback');
  }
}

/**
 * Fonction pour récupérer la question secrète d'un utilisateur à partir de son email
 */
export const getSecretQuestion = async (email: string) => {
  const response = await fetch(`${API_URL}/api/get-secret-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Adresse email non trouvée');
  }
  return data;
};

/**
 * Fonction pour réinitialiser le mot de passe d'un utilisateur après vérification de sa question secrète
 */
export const resetPassword = async (userId: number, secretAnswer: string) => {
  const response = await fetch(`${API_URL}/api/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, secretAnswer }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Réponse incorrecte à la question secrète');
  }
  return data;
};