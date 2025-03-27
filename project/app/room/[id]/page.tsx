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
  IconBrandYoutube,
  IconUsers,
  IconDoorExit,
  IconX
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
      
      // Écouter les notifications de téléchargement
      socket.socket?.on('song-download-started', () => {
        setIsDownloading(true);
        toast({
          title: "Téléchargement",
          description: "Téléchargement de la musique en cours...",
        });
      });
      
      // Écouter les informations sur la chanson en cours
      socket.socket?.on('song-playing', (songInfo: SongInfo) => {
        setCurrentSong(songInfo);
        setIsDownloading(false);
        toast({
          title: "Lecture",
          description: `Lecture de "${songInfo.title}"`,
        });
        
        // Lancer la lecture automatiquement
        if (audioRef.current) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://87.106.162.205:5001';
          audioRef.current.src = `${apiUrl}${songInfo.url}`;
          audioRef.current.play().catch(err => console.error('Erreur de lecture:', err));
        }
      });
      
      // Écouter la fin de la chanson
      socket.socket?.on('song-ended', () => {
        setCurrentSong(null);
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
      
      // Nettoyage à la déconnexion
      return () => {
        console.log("Déconnexion de la room Socket.IO:", roomId);
        socket.socket?.emit('leave-room', roomId, user.id);
        socket.socket?.off('new-message');
        socket.socket?.off('song-download-started');
        socket.socket?.off('song-playing');
        socket.socket?.off('song-ended');
        socket.socket?.off('song-error');
        socket.socket?.off('room-closed');
        socket.socket?.off('user-joined');
        socket.socket?.off('user-left');
        socket.socket?.off('user-joined-with-data');
        socket.socket?.off('user-left-with-data');
      };
    }
  }, [socket, user, roomId, router, toast, suppressNotifications]);

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
                  className="bg-violet-600 hover:bg-violet-700 flex items-center gap-1"
                  disabled={isDownloading}
                >
                  <IconBrandYoutube className="h-4 w-4" />
                  Ajouter une musique
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
                          {Math.floor(currentSong.duration / 60)}:{String(currentSong.duration % 60).padStart(2, '0')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <audio 
                    ref={audioRef}
                    controls 
                    className="w-full"
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