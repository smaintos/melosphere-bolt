'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/app/hooks/useAuth';
import { useSocket } from '@/app/context/SocketContext';
import { Room, Message, SongInfo } from '@/lib/types';
import { roomsApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import {
  IconArrowLeft,
  IconSend,
  IconMusic,
  IconPlayerPlay,
  IconPlayerPause,
  IconBrandYoutube,
  IconUsers,
  IconDoorExit,
  IconX,
  IconVolume
} from '@tabler/icons-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getFullImageUrl } from '@/lib/utils';

export default function RoomDetailPage() {
  const { id } = useParams();
  const roomId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuth();
  const socket = useSocket();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const songStartTimeRef = useRef<number | null>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const hasAutoPlayedRef = useRef<boolean>(false);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isAddingSong, setIsAddingSong] = useState(false);
  
  // Variable pour suivre si nous sommes dans la période de grâce après création
  const [suppressNotifications, setSuppressNotifications] = useState(false);

  const [audioState, setAudioState] = useState<{
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    volume: number;
  }>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 0.8,
  });

  // Ajouter une state pour la progression manuelle du timer
  const [manualTimer, setManualTimer] = useState({
    duration: 0, 
    currentTime: 0,
    isActive: false
  });

  // Ajouter un état pour suivre qui est en train d'écrire
  const [usersTyping, setUsersTyping] = useState<{id: number, username: string}[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les détails de la room
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const data = await roomsApi.getRoomById(roomId);
        setRoom(data);
        setMessages(data.messages);
        setError(null);
        
        // Vérifier si la room vient d'être créée (moins de 5 secondes)
        const roomCreationTime = new Date(data.createdAt).getTime();
        const currentTime = Date.now();
        const timeDifference = currentTime - roomCreationTime;
        
        // Si la room a été créée il y a moins de 5 secondes, supprimer les notifications
        if (timeDifference < 5000) {
          setSuppressNotifications(true);
          
          // Après 5 secondes, réactiver les notifications
          setTimeout(() => {
            setSuppressNotifications(false);
          }, 5000 - timeDifference);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des détails de la room:', err);
        setError('Impossible de charger les détails de la room.');
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la room.",
          variant: "destructive"
        });
        
        // Rediriger vers la liste des rooms si la room n'existe pas
        router.push('/room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, router, toast]);

  // Connexion à la room via Socket.IO
  useEffect(() => {
    if (socket && socket.isConnected && user && roomId) {
      console.log("Connexion à la room Socket.IO:", roomId);
      
      // Rejoindre la room via l'API et Socket.IO simultanément
      const joinRoomAndUpdateState = async () => {
        try {
          // 1. Appel API pour rejoindre la room et obtenir les données mises à jour immédiatement
          console.log("Appel API pour rejoindre la room");
          const updatedRoomData = await roomsApi.joinRoom(roomId);
          console.log("Données reçues après join API:", updatedRoomData);
          
          // 2. Mettre à jour l'état avec les données fraîches reçues de l'API
          setRoom(prevRoom => ({
            ...updatedRoomData,
            _lastUpdated: Date.now()
          }));
          
          // 3. Puis connecter via Socket.IO pour les mises à jour continues
          socket.socket?.emit('join-room', roomId, user.id);
        } catch (error) {
          console.error("Erreur lors de la connexion à la room:", error);
          toast({
            title: "Erreur",
            description: "Impossible de rejoindre la room. Veuillez réessayer.",
            variant: "destructive"
          });
        }
      };
      
      // Lancer le processus de connexion
      joinRoomAndUpdateState();
      
      // Écouter les nouveaux messages
      socket.socket?.on('new-message', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      
      // NOUVEAU: Écouter l'événement amélioré user-joined-with-data qui contient toutes les données de la room
      socket.socket?.on('user-joined-with-data', (updatedRoom: Room) => {
        console.log("Données complètes reçues - utilisateur a rejoint:", updatedRoom);
        
        if (updatedRoom) {
          // Mettre à jour directement avec les données complètes
          setRoom(updatedRoom);
          
          // Afficher une notification seulement si nous ne sommes pas dans la période de grâce
          if (!suppressNotifications) {
            toast({
              title: "Nouvel utilisateur",
              description: "Un utilisateur a rejoint la room.",
            });
          }
        }
      });
      
      // Conserver également l'ancien événement pour la compatibilité
      socket.socket?.on('user-joined', async (userId: number) => {
        console.log("Ancien événement - utilisateur a rejoint:", userId);
        
        // Si nous n'avons pas reçu l'événement complet, essayer de récupérer les données
        try {
          const updatedRoomData = await roomsApi.getRoomById(roomId);
          
          if (updatedRoomData) {
            // Éviter de remplacer si nous avons déjà reçu les données complètes
            setRoom(prevRoom => {
              // Si l'événement complet a déjà mis à jour la room avec cet utilisateur
              const hasUser = prevRoom?.users?.some(u => u.id === userId);
              if (hasUser) return prevRoom;
              
              return {
                ...prevRoom,
                ...updatedRoomData,
                _lastUpdated: Date.now()
              };
            });
          }
          
          // Afficher une notification seulement si nous ne sommes pas dans la période de grâce
          if (!suppressNotifications) {
            toast({
              title: "Nouvel utilisateur",
              description: "Un utilisateur a rejoint la room.",
            });
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour des infos de la room:", error);
        }
      });
      
      // NOUVEAU: Écouter l'événement amélioré user-left-with-data qui contient toutes les données de la room
      socket.socket?.on('user-left-with-data', (updatedRoom: Room) => {
        console.log("Données complètes reçues - utilisateur a quitté:", updatedRoom);
        
        if (updatedRoom) {
          // Mettre à jour directement avec les données complètes
          setRoom(updatedRoom);
          
          // Afficher une notification seulement si nous ne sommes pas dans la période de grâce
          if (!suppressNotifications) {
            toast({
              title: "Utilisateur parti",
              description: "Un utilisateur a quitté la room.",
            });
          }
        }
      });
      
      // Conserver également l'ancien événement pour la compatibilité
      socket.socket?.on('user-left', async (userId: number) => {
        console.log("Ancien événement - utilisateur a quitté:", userId);
        
        // Si nous n'avons pas reçu l'événement complet, essayer de récupérer les données
        try {
          const updatedRoomData = await roomsApi.getRoomById(roomId);
          
          // Éviter de remplacer si nous avons déjà reçu les données complètes
          setRoom(prevRoom => {
            // Si l'événement complet a déjà mis à jour la room sans cet utilisateur
            const stillHasUser = prevRoom?.users?.some(u => u.id === userId);
            if (!stillHasUser) return prevRoom;
            
            return {
              ...updatedRoomData,
              _lastUpdated: Date.now()
            };
          });
          
          // Afficher une notification seulement si nous ne sommes pas dans la période de grâce
          if (!suppressNotifications) {
            toast({
              title: "Utilisateur parti",
              description: "Un utilisateur a quitté la room.",
            });
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour des infos de la room:", error);
        }
      });
      
      // Écouter les événements de musique et gérer la synchronisation de la lecture
      socket.socket?.on('song-download-started', () => {
        setIsDownloading(true);
        toast({
          title: "Téléchargement",
          description: "Téléchargement de la musique en cours...",
        });
      });
      
      // Écouter les informations sur la chanson en cours et le signal de démarrage
      socket.socket?.on('song-playing', (songInfo: any) => {
        console.log("Signal de lecture reçu:", songInfo);
        setIsDownloading(false);
        setCurrentSong(songInfo);
        
        // Récupérer la durée directement depuis les données de la chanson
        const songDuration = songInfo.duration || 0;
        console.log("⏱️ Durée extraite du signal:", songDuration);
        
        // Initialiser le timer manuel avec la durée reçue
        setManualTimer({
          duration: songDuration,
          currentTime: 0,
          isActive: true
        });
        
        // Stocker le temps de démarrage pour les calculs de synchronisation
        songStartTimeRef.current = songInfo.startTime;
        
        if (audioRef.current) {
          try {
            // Préparer l'audio avec le chemin correct
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://87.106.162.205:5001';
            const audioUrl = `${apiUrl}${songInfo.url}`;
            console.log("Chargement de l'audio depuis:", audioUrl);
            
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            
            // Calculer le délai pour démarrer la lecture
            const currentTime = Date.now();
            const delay = songInfo.startTime - currentTime;
            
            console.log(`Délai de lecture programmé: ${delay}ms`);
            
            // Fonction pour tenter plusieurs stratégies de lecture automatique
            const tryAutoPlay = async (audio: HTMLAudioElement) => {
              // Stratégie 1: Essayer de lire directement
              try {
                await audio.play();
                return true;
              } catch (error) {
                console.log("Stratégie 1 échouée, tentative avec le son coupé");
              }
              
              // Stratégie 2: Essayer de lire avec le son coupé
              try {
                const originalVolume = audio.volume;
                audio.volume = 0;
                await audio.play();
                
                // Rétablir progressivement le volume après le démarrage
                setTimeout(() => {
                  // Augmenter progressivement le volume pour éviter une transition brutale
                  const fadeIn = setInterval(() => {
                    if (audio.volume < originalVolume) {
                      audio.volume = Math.min(audio.volume + 0.1, originalVolume);
                    } else {
                      clearInterval(fadeIn);
                    }
                  }, 100);
                }, 500);
                
                return true;
              } catch (error) {
                console.error("Échec de toutes les stratégies de lecture automatique:", error);
                return false;
              }
            };
            
            // Gérer le cas où le délai est positif (futur)
            if (delay > 0) {
              toast({
                title: "Synchronisation",
                description: `Lecture automatique dans ${Math.ceil(delay/1000)} secondes`,
              });
              
              setTimeout(async () => {
                console.log("Tentative de lecture automatique");
                
                const success = await tryAutoPlay(audioRef.current!);
                
                if (!success) {
                  // Créer un message pour l'utilisateur
                  toast({
                    title: "Interaction requise",
                    description: "Cliquez sur Play pour démarrer la lecture",
                    variant: "destructive",
                  });
                }
              }, delay);
            } 
            // Gérer le cas où le délai est négatif (nous sommes en retard)
            else {
              const seekPosition = Math.abs(delay) / 1000;
              console.log(`Rattrapage: positionnement à ${seekPosition}s`);
              
              audioRef.current.currentTime = seekPosition;
              tryAutoPlay(audioRef.current);
            }
          } catch (error) {
            console.error("Erreur lors de la préparation de l'audio:", error);
            toast({
              title: "Erreur",
              description: "Impossible de lire l'audio",
              variant: "destructive"
            });
          }
        }
      });
      
      // Écouter la fin de la chanson
      socket.socket?.on('song-ended', () => {
        setCurrentSong(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        // Arrêter le timer manuel
        setManualTimer(prev => ({ ...prev, isActive: false, currentTime: 0 }));
        
        toast({
          title: "Lecture terminée",
          description: "La chanson est terminée.",
        });
      });
      
      // Écouter les erreurs de téléchargement
      socket.socket?.on('song-error', (error: { error: string }) => {
        setIsDownloading(false);
        toast({
          title: "Erreur",
          description: `Erreur lors du téléchargement: ${error.error}`,
          variant: "destructive"
        });
      });
      
      // Écouter la fermeture de la room
      socket.socket?.on('room-closed', () => {
        toast({
          title: "Room fermée",
          description: "Cette room a été fermée par son créateur.",
          variant: "destructive"
        });
        router.push('/room');
      });
      
      // Écouter les événements de synchronisation
      socket.socket?.on('playback-sync', ({ currentTime, userId }: { currentTime: number, userId: number }) => {
        if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 3) {
          console.log(`Resynchronisation de la lecture: différence de ${Math.abs(audioRef.current.currentTime - currentTime)}s`);
          audioRef.current.currentTime = currentTime;
        }
      });
      
      // Envoyer périodiquement l'état de la lecture pour synchronisation
      syncTimerRef.current = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused && user && currentSong) {
          socket.socket?.emit('sync-playback', roomId, audioRef.current.currentTime, user.id);
        }
      }, 10000); // Synchroniser toutes les 10 secondes
      
      // Ajouter les écouteurs pour le "typing indicator"
      socket.socket?.on('user-typing', ({userId, username}: {userId: number, username: string}) => {
        // Ne pas ajouter notre propre indication de frappe
        if (userId === user.id) return;
        
        setUsersTyping(prev => {
          // Vérifier si cet utilisateur est déjà dans la liste
          const alreadyTyping = prev.some(u => u.id === userId);
          if (alreadyTyping) return prev;
          
          return [...prev, {id: userId, username}];
        });
      });
      
      socket.socket?.on('user-stop-typing', (userId: number) => {
        setUsersTyping(prev => prev.filter(u => u.id !== userId));
      });
      
      // Nettoyer à la déconnexion
      return () => {
        console.log("Déconnexion de la room Socket.IO:", roomId);
        socket.socket?.emit('leave-room', roomId, user.id);
        socket.socket?.off('new-message');
        socket.socket?.off('user-joined');
        socket.socket?.off('user-left');
        socket.socket?.off('user-joined-with-data');
        socket.socket?.off('user-left-with-data');
        socket.socket?.off('song-download-started');
        socket.socket?.off('song-playing');
        socket.socket?.off('song-ended');
        socket.socket?.off('song-error');
        socket.socket?.off('room-closed');
        socket.socket?.off('playback-sync');
        socket.socket?.off('user-typing');
        socket.socket?.off('user-stop-typing');
        if (syncTimerRef.current) {
          clearInterval(syncTimerRef.current);
        }
      };
    }
  }, [socket, user, roomId, router, toast, suppressNotifications]);

  // Gérer les événements de l'audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Définir une fonction pour initialiser l'audio après chargement
    const initAudio = () => {
      // Forcer la récupération de la durée une fois que les métadonnées sont chargées
      if (audio.duration && audio.duration > 0) {
        console.log("⏱️ Durée audio détectée:", audio.duration);
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration
        }));
      }
    };
    
    // Déclencher l'initialisation lors du chargement des métadonnées
    audio.addEventListener('loadedmetadata', initAudio);
    
    // Essayer d'initialiser immédiatement si les métadonnées sont déjà disponibles
    if (audio.readyState >= 2) {
      initAudio();
    }
    
    // Mettre à jour le timer fréquemment pour une animation plus fluide
    const timerInterval = setInterval(() => {
      if (!audio.paused && audio.duration > 0) {
        setAudioState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
          duration: audio.duration
        }));
      }
    }, 100); // Mise à jour plus fréquente pour une animation fluide
    
    const handleTimeUpdate = () => {
      setAudioState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };
    
    const handleDurationChange = () => {
      if (audio.duration && audio.duration > 0) {
        console.log("⏱️ Durée mise à jour:", audio.duration);
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration,
        }));
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audio.duration && audio.duration > 0) {
        console.log("⏱️ Métadonnées chargées, durée:", audio.duration);
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration,
        }));
      }
    };
    
    const handleLoadedData = () => {
      if (audio.duration && audio.duration > 0) {
        console.log("⏱️ Données audio chargées, durée:", audio.duration);
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration,
        }));
      }
    };
    
    const handleCanPlay = () => {
      if (audio.duration && audio.duration > 0) {
        console.log("⏱️ Audio prêt à être joué, durée:", audio.duration);
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration,
        }));
      }
    };
    
    const handleVolumeChange = () => {
      setAudioState(prev => ({
        ...prev,
        volume: audio.volume,
      }));
    };
    
    const handlePlay = () => {
      console.log("▶️ Lecture démarrée");
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
      }));
    };
    
    const handlePause = () => {
      console.log("⏸️ Lecture en pause");
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    };
    
    const handleEnded = () => {
      console.log("⏹️ Lecture terminée");
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
      
      // Informer le serveur que la chanson est terminée
      if (socket && socket.isConnected && roomId) {
        socket.socket?.emit('song-ended', roomId);
      }
    };
    
    // Ajouter les écouteurs d'événements
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    
    // Nettoyer les écouteurs d'événements
    return () => {
      clearInterval(timerInterval);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', initAudio);
    };
  }, [roomId, socket]);

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !room) return;
    
    try {
      await roomsApi.sendMessage(roomId, messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Erreur lors de l&apos;envoi du message:', err);
      toast({
        title: "Erreur",
        description: "Impossible d&apos;envoyer le message. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Ajouter une musique depuis YouTube
  const handleAddSong = async () => {
    if (!youtubeUrl.trim() || !room) return;
    
    // Vérifier si une musique est déjà en cours de lecture
    if (currentSong && audioState.isPlaying) {
      toast({
        title: "Lecture en cours",
        description: "Une musique est déjà en cours de lecture. Attendez la fin ou mettez en pause avant d'ajouter une nouvelle musique.",
        variant: "destructive"
      });
      setYoutubeDialogOpen(false);
      return;
    }
    
    try {
      setIsAddingSong(true);
      setYoutubeDialogOpen(false);
      
      await roomsApi.playYoutubeVideo(roomId, youtubeUrl);
      setYoutubeUrl('');
    } catch (err) {
      console.error('Erreur lors de l&apos;ajout de la musique:', err);
      toast({
        title: "Erreur",
        description: "Impossible d&apos;ajouter la musique. Veuillez vérifier l&apos;URL et réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsAddingSong(false);
    }
  };

  // Quitter la room
  const handleLeaveRoom = async () => {
    try {
      await roomsApi.leaveRoom(roomId);
      router.push('/room');
    } catch (err) {
      console.error('Erreur lors de la déconnexion de la room:', err);
      toast({
        title: "Erreur",
        description: "Impossible de quitter la room. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Fermer la room (seulement pour le créateur)
  const handleCloseRoom = async () => {
    if (!room || !user || room.creatorId !== user.id) return;
    
    if (confirm('Êtes-vous sûr de vouloir fermer cette room ? Tous les utilisateurs seront déconnectés.')) {
      try {
        await roomsApi.closeRoom(roomId);
        router.push('/room');
      } catch (err) {
        console.error('Erreur lors de la fermeture de la room:', err);
        toast({
          title: "Erreur",
          description: "Impossible de fermer la room. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    }
  };

  // Rafraîchissement automatique des informations de la room - Limité aux cas de secours
  useEffect(() => {
    if (!roomId || loading) return;
    
    // Fonction pour charger les dernières informations de la room en cas de secours
    const refreshRoomData = async () => {
      // Vérifier si la dernière mise à jour est trop ancienne (plus de 30 secondes)
      if (room && Date.now() - (room._lastUpdated || 0) < 30000) {
        return; // Pas besoin de rafraîchir si les données sont récentes
      }
      
      try {
        console.log("Rafraîchissement de secours des données de la room");
        const updatedData = await roomsApi.getRoomById(roomId);
        
        // Ne mettre à jour que si la room existe toujours et est active
        if (updatedData && updatedData.isActive) {
          console.log("Mise à jour de secours des données de la room");
          
          setRoom(prevRoom => ({
            ...updatedData,
            _lastUpdated: Date.now()
          }));
        } else if (updatedData && !updatedData.isActive) {
          // La room a été fermée entre temps
          toast({
            title: "Room fermée",
            description: "Cette room a été fermée par son créateur",
            variant: "destructive"
          });
          router.push('/room');
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données de la room:', error);
      }
    };
    
    // Lancer le rafraîchissement automatique toutes les 30 secondes comme dernier recours
    const interval = setInterval(refreshRoomData, 30000);
    
    // Effectuer un rafraîchissement initial pour s'assurer d'avoir les données complètes
    if (!room || !room._lastUpdated) {
      refreshRoomData();
    }
    
    // Nettoyage à la déconnexion
    return () => clearInterval(interval);
  }, [roomId, loading, router, toast, room]);

  // Modifier l'effet pour cliquer sur le bouton play invisible lorsque le composant est monté
  useEffect(() => {
    if (currentSong && audioRef.current && !hasAutoPlayedRef.current && playButtonRef.current) {
      // Attendre que l'audio soit chargé
      const handleCanPlay = () => {
        console.log("Audio chargé, déclenchement automatique de la lecture");
        
        // Déclencher automatiquement la lecture
        playButtonRef.current?.click();
        
        // Marquer comme déjà auto-joué pour éviter les boucles
        hasAutoPlayedRef.current = true;
        
        // Retirer l'écouteur
        audioRef.current?.removeEventListener('canplaythrough', handleCanPlay);
      };
      
      // Ajouter un écouteur pour savoir quand l'audio est prêt
      audioRef.current.addEventListener('canplaythrough', handleCanPlay);
      
      // Nettoyer l'écouteur si le composant est démonté
      return () => {
        audioRef.current?.removeEventListener('canplaythrough', handleCanPlay);
      };
    }
  }, [currentSong]);

  // Réinitialiser le flag d'auto-play quand la chanson change
  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [currentSong?.url]);

  // Ajouter un effet pour gérer le timer manuel
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    
    if (manualTimer.isActive) {
      timerInterval = setInterval(() => {
        setManualTimer(prev => {
          // Arrêter le timer s'il atteint la durée totale
          if (prev.currentTime >= prev.duration) {
            clearInterval(timerInterval as NodeJS.Timeout);
            return { ...prev, isActive: false, currentTime: 0 };
          }
          
          // Sinon, incrémenter le temps actuel
          return { ...prev, currentTime: prev.currentTime + 1 };
        });
      }, 1000);
    }
    
    // Nettoyer le timer lors du démontage
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [manualTimer.isActive]);

  // Gérer le changement du message input pour signaler quand l'utilisateur tape
  useEffect(() => {
    // Seulement si l'utilisateur a commencé à taper quelque chose
    if (messageInput.trim().length > 0 && socket && socket.isConnected && user && roomId) {
      // Émettre l'événement "user-typing"
      socket.socket?.emit('user-typing', roomId, user.id, user.username || 'Utilisateur');
      
      // Nettoyer le timer précédent si existant
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Définir un délai après lequel nous considérons que l'utilisateur a arrêté de taper
      typingTimeoutRef.current = setTimeout(() => {
        socket.socket?.emit('user-stop-typing', roomId, user.id);
      }, 2000); // 2 secondes d'inactivité = arrêt de frappe
    } else if (messageInput.trim().length === 0 && socket && socket.isConnected && user && roomId) {
      // Si l'utilisateur efface tout, signaler immédiatement l'arrêt de frappe
      socket.socket?.emit('user-stop-typing', roomId, user.id);
      
      // Nettoyer le timer
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
    
    // Nettoyer le timer lors du démontage
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, socket, user, roomId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="w-12 h-12 md:w-16 md:h-16 relative">
          <div className="absolute inset-0 border-4 border-violet-200 border-opacity-20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 md:mt-6 text-sm md:text-base text-violet-400 font-medium">Chargement en cours...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <ProtectedRoute>
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center min-h-screen pt-20 md:pt-24">
          <Card className="w-full max-w-2xl p-4 md:p-8 bg-zinc-900/50 border-violet-500/20">
            <div className="flex flex-col items-center gap-4 text-center">
              <IconX className="w-16 h-16 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Erreur</h1>
              <p className="text-zinc-400">{error || "Impossible de charger la room"}</p>
              <Button 
                onClick={() => router.push('/room')}
                className="mt-4 bg-violet-600 hover:bg-violet-700"
              >
                Retour aux rooms
              </Button>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* Bouton retour */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/room">
          <Button 
            variant="outline" 
            className="bg-zinc-900/70 backdrop-blur-sm hover:bg-zinc-800 border border-violet-500/30 text-white"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="flex-1 p-4 md:p-8 flex flex-col min-h-screen pt-20 md:pt-24">
        {/* En-tête de la room */}
        <div className="flex justify-between items-center mb-6 w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{room.name}</h1>
            <p className="text-zinc-400 text-sm flex items-center mt-1">
              <span>Créée par {room.creator?.username || 'Utilisateur inconnu'}</span>
              <span className="mx-2">•</span>
              <span>
                {room.createdAt && !isNaN(new Date(room.createdAt).getTime()) 
                  ? formatDistanceToNow(new Date(room.createdAt), { addSuffix: true, locale: fr })
                  : 'Date inconnue'
                }
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {user && room.creatorId === user.id ? (
              <Button 
                variant="destructive"
                onClick={handleCloseRoom}
                className="flex items-center gap-1"
              >
                <IconX className="h-4 w-4" />
                Fermer
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={handleLeaveRoom}
                className="flex items-center gap-1"
              >
                <IconDoorExit className="h-4 w-4" />
                Quitter
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Lecteur audio */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900/70 border-violet-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <IconMusic className="h-5 w-5 text-violet-400" />
                  Lecteur
                </h2>
                <Button 
                  onClick={() => setYoutubeDialogOpen(true)}
                  className={`flex items-center gap-1 ${
                    audioState.isPlaying
                      ? "bg-gray-600 hover:bg-gray-700" 
                      : "bg-violet-600 hover:bg-violet-700"
                  }`}
                  disabled={isDownloading || audioState.isPlaying}
                >
                  <IconBrandYoutube className="h-4 w-4" />
                  {audioState.isPlaying
                    ? "Lecture en cours..."
                    : "Ajouter une musique"
                  }
                </Button>
              </div>

              {isDownloading ? (
                <div className="flex flex-col items-center justify-center p-10 bg-zinc-800/50 rounded-lg">
                  <div className="w-12 h-12 border-4 border-t-violet-500 border-violet-200 rounded-full animate-spin mb-4"></div>
                  <p className="text-zinc-300">Téléchargement en cours...</p>
                </div>
              ) : currentSong ? (
                <div>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <img 
                      src={currentSong.thumbnail} 
                      alt={currentSong.title} 
                      className="w-full md:w-40 h-auto rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white line-clamp-2">{currentSong.title}</h3>
                      <p className="text-zinc-400 mb-2">{currentSong.channel}</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Badge variant="outline" className="bg-zinc-800/50">
                          {manualTimer.duration > 0 
                            ? `${Math.floor(manualTimer.duration / 60)}:${String(Math.floor(manualTimer.duration % 60)).padStart(2, '0')}`
                            : audioState.duration > 0 
                              ? `${Math.floor(audioState.duration / 60)}:${String(Math.floor(audioState.duration % 60)).padStart(2, '0')}`
                              : "00:00"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Interface de lecture avec timer visuel amélioré basé sur le timer manuel */}
                  <div className="mt-2 mb-5">
                    <div className="w-full h-3 bg-zinc-800 border border-zinc-700 rounded-full mb-2 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-700 rounded-full transition-all"
                        style={{ 
                          width: `${manualTimer.duration > 0 
                            ? (manualTimer.currentTime / manualTimer.duration) * 100 
                            : audioState.duration > 0 
                              ? (audioState.currentTime / audioState.duration) * 100 
                              : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    {/* Timer visuel basé sur le timer manuel */}
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span className="tabular-nums">
                        {manualTimer.isActive 
                          ? `${Math.floor(manualTimer.currentTime / 60)}:${String(Math.floor(manualTimer.currentTime % 60)).padStart(2, '0')}`
                          : audioState.currentTime > 0 
                            ? `${Math.floor(audioState.currentTime / 60)}:${String(Math.floor(audioState.currentTime % 60)).padStart(2, '0')}`
                            : "00:00"}
                      </span>
                      <span className="tabular-nums">
                        {manualTimer.duration > 0 
                          ? `-${Math.floor((manualTimer.duration - manualTimer.currentTime) / 60)}:${String(Math.floor((manualTimer.duration - manualTimer.currentTime) % 60)).padStart(2, '0')}` 
                          : audioState.duration > 0 
                            ? `-${Math.floor((audioState.duration - audioState.currentTime) / 60)}:${String(Math.floor((audioState.duration - audioState.currentTime) % 60)).padStart(2, '0')}` 
                            : "-00:00"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Débogage du temps pour voir les valeurs récupérées */}
                  <div className="hidden">
                    Timer manuel: {manualTimer.currentTime.toFixed(0)} / {manualTimer.duration.toFixed(0)} | 
                    Audio: {audioState.currentTime.toFixed(2)} / {audioState.duration.toFixed(2)}
                  </div>
                  
                  {/* Bouton play invisible pour déclenchement automatique */}
                  <Button 
                    ref={playButtonRef}
                    className="hidden"
                    onClick={() => {
                      if (audioRef.current) {
                        if (audioRef.current.paused) {
                          console.log("Tentative de lecture via le bouton invisible");
                          audioRef.current.play().catch(err => console.error('Erreur de lecture:', err));
                        }
                      }
                    }}
                  >
                    Lire
                  </Button>
                  
                  {/* Élément audio avec preload eager pour assurer le chargement des métadonnées */}
                  <audio 
                    ref={audioRef}
                    className="hidden"
                    preload="auto"
                    autoPlay
                  >
                    <source src={getFullImageUrl(currentSong?.url)} type="audio/mpeg" />
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 bg-zinc-800/50 rounded-lg">
                  <IconPlayerPlay className="h-12 w-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400 text-center">
                    Aucune musique en cours de lecture.<br />
                    Ajoutez une musique pour commencer !
                  </p>
                </div>
              )}
            </Card>
            
            {/* Participants */}
            <Card className="bg-zinc-900/70 border-violet-500/20 p-6 mt-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <IconUsers className="h-5 w-5 text-violet-400" />
                Participants ({room.users ? room.users.length : 0})
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {room.users && room.users.map((roomUser) => (
                  <Badge key={roomUser.id} variant="outline" className="bg-zinc-800/50 p-1 pl-0.5 pr-2">
                    <Avatar className="h-6 w-6 mr-1">
                      <AvatarImage src={getFullImageUrl(roomUser.profilePicture)} alt={roomUser.username} />
                      <AvatarFallback>{roomUser.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{roomUser.username}</span>
                    {room.creatorId === roomUser.id && (
                      <span className="ml-1 text-xs text-violet-400">(créateur)</span>
                    )}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Chat */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900/70 border-violet-500/20 h-full flex flex-col">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="text-xl font-semibold text-white">Chat</h2>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                {!messages || messages.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <p>Aucun message.</p>
                    <p>Soyez le premier à écrire !</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getFullImageUrl(message.user?.profilePicture)} alt={message.user?.username || 'Utilisateur'} />
                          <AvatarFallback>{message.user?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {message.user?.username || 'Utilisateur inconnu'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                          <p className="text-zinc-300 break-words">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Indicateur de frappe */}
              {usersTyping.length > 0 && (
                <div className="px-3 py-2 border-t border-zinc-800 text-xs text-zinc-400 italic">
                  {usersTyping.length === 1 ? (
                    <div className="flex items-center">
                      <span className="mr-1">{usersTyping[0].username} est en train d'écrire</span>
                      <span className="flex">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-100">.</span>
                        <span className="animate-bounce delay-200">.</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-1">
                        {usersTyping.map(u => u.username).join(', ')} sont en train d'écrire
                      </span>
                      <span className="flex">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-100">.</span>
                        <span className="animate-bounce delay-200">.</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-3 border-t border-zinc-800">
                <div className="flex gap-2">
                  <Input
                    placeholder="Écrivez un message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-violet-600 hover:bg-violet-700"
                    disabled={!messageInput.trim()}
                  >
                    <IconSend className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialogue pour ajouter une musique YouTube */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="bg-zinc-900 border-violet-500/20">
          <DialogHeader>
            <DialogTitle>Ajouter une musique YouTube</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="URL YouTube (ex: https://www.youtube.com/watch?v=...)"
              className="bg-zinc-800 border-zinc-700"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddSong}
              disabled={isAddingSong || !youtubeUrl.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isAddingSong ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
} 