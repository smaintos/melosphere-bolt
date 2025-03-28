// Types pour l'interface utilisateur
export interface User {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
}

// Types pour les rooms
export interface Room {
  id: string;
  name: string;
  creatorId: number;
  creator: {
    id: number;
    username: string;
    profilePicture?: string;
  };
  isActive: boolean;
  createdAt: string;
  currentSong?: string;
  users: User[];
  messages: Message[];
  userCount?: number;
  _count?: {
    users: number;
  };
  _lastUpdated?: number; // Timestamp pour suivre la dernière mise à jour côté client
}

// Types pour les messages
export interface Message {
  id: number;
  content: string;
  userId: number;
  roomId: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

// Type pour les infos de chanson
export interface SongInfo {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  url: string;
  videoId: string;
  addedAt: number;
  startTime?: number;
  addedBy?: number;
} 