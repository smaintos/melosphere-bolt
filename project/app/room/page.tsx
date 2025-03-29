'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '../hooks/useAuth';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconMusicPlus, IconUsers, IconMusic, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { motion } from "framer-motion";

import { useToast } from "@/components/ui/use-toast";
import { Room } from '@/lib/types';
import { roomsApi } from '@/lib/api';
import { getFullImageUrl } from '@/lib/utils';

export default function RoomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);

  // Charger la liste des rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await roomsApi.getAllRooms();
        
        // S'assurer que les données des utilisateurs sont complètes
        const roomsWithUserCount = data.map((room: Room) => ({
          ...room,
          // Toujours compter au moins 1 utilisateur (le créateur) même si la liste est vide
          userCount: room._count?.users || (room.users?.length || 1)
        }));
        
        setRooms(roomsWithUserCount);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des rooms:', err);
        setError('Impossible de charger les rooms pour le moment.');
        toast({
          title: "Erreur",
          description: "Impossible de charger les rooms. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    // Rafraîchir les rooms toutes les 10 secondes au lieu de 30 pour être plus réactif
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [toast]);

  // Créer une nouvelle room
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la room ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreatingRoom(true);
      const newRoom = await roomsApi.createRoom(newRoomName);
      setCreateDialogOpen(false);
      setNewRoomName('');
      
      toast({
        title: "Succès",
        description: "Room créée avec succès !",
      });
      
      // Rediriger vers la nouvelle room
      router.push(`/room/${newRoom.id}`);
    } catch (err) {
      console.error('Erreur lors de la création de la room:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer la room. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setCreatingRoom(false);
    }
  };

  // Fonction pour rejoindre une room
  const handleJoinRoom = async (roomId: string) => {
    setJoiningRoomId(roomId);
    
    try {
      // Appel API pour rejoindre la room
      console.log("Tentative de rejoindre la room:", roomId);
      const response = await roomsApi.joinRoom(roomId);
      console.log("Réponse complète après joinRoom:", response);
      
      // Si la réponse est positive, rediriger vers la page de la room
      if (response) {
        toast({
          title: "Succès",
          description: "Vous avez rejoint la room avec succès.",
        });
        router.push(`/room/${roomId}`);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion à la room:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre la room. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setJoiningRoomId(null);
    }
  };

  return (
    <ProtectedRoute>
      {/* Fond animé */}
      <div className="fixed inset-0 z-0 bg-black overflow-hidden">
        <div className="absolute w-full h-full opacity-30 animate-nebula-move">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-violet-600/40 to-indigo-900/30 blur-xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-bl from-indigo-600/30 to-violet-900/40 blur-xl animate-float"></div>
          <div className="absolute top-2/3 right-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/30 to-violet-900/40 blur-xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 right-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-fuchsia-600/20 to-purple-900/30 blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-l from-violet-600/30 to-indigo-900/40 blur-xl animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
        </div>
         
        {/* Image de mesh en rotation */}
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-40">
          <div className="w-[1200px] h-[1200px] flex items-center justify-center animate-spin-very-slow">
            <Image 
              src="https://img.icons8.com/dotty/80/ffffff/mesh.png" 
              alt="mesh"
              width={1200}
              height={1200}
              className="opacity-50 drop-shadow-[0_0_50px_rgba(139,92,246,1)] filter hue-rotate-[270deg]"
              priority
            />
          </div>
        </div>
         
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[30px] z-20"></div>
      </div>

      {/* Bouton retour */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/">
          <Button 
            variant="outline" 
            className="bg-zinc-900/90 backdrop-blur-sm hover:bg-zinc-800 border border-violet-500/30 text-white"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>
    
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center min-h-screen pt-10 relative z-30">
        <div className="w-full max-w-6xl mb-16">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center">
              <h1 className="text-3xl md:text-5xl font-normal bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300 tracking-tight text-center">
                Live dans la melosphere !
              </h1>
            </div>
            
            <p className="text-zinc-400 text-center text-lg max-w-3xl">
              Rejoignez une room.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8"
            >
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-transparent hover:bg-transparent px-8 py-6 text-lg border border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all duration-300"
                variant="ghost"
              >
                <IconMusicPlus className="h-5 w-5 mr-2" />
                Créer un salon
              </Button>
            </motion.div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center w-full py-20">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border-4 border-violet-200/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-violet-400 font-medium">Recherche de rooms disponibles...</p>
          </div>
        ) : error ? (
          <div className="backdrop-blur-md bg-zinc-900/30 w-full max-w-2xl p-8 rounded-xl border border-red-500/20 shadow-[0_0_25px_rgba(220,38,38,0.15)]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <IconInfoCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                Erreur de chargement
              </h2>
              <p className="text-zinc-400">{error}</p>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="backdrop-blur-md bg-zinc-900/30 w-full max-w-3xl p-10 rounded-xl border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.15)] mt-4 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-24 h-24 bg-violet-600/20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <div className="w-16 h-16 flex items-center justify-center animate-spin-slow">
                  <Image 
                    src="https://img.icons8.com/dotty/80/ffffff/mesh.png" 
                    alt="mesh"
                    width={32}
                    height={32}
                    className="opacity-80 drop-shadow-[0_0_10px_rgba(139,92,246,1)] filter hue-rotate-[270deg]"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 tracking-tight">
                  Aucune room active
                </h2>
                <p className="text-zinc-300 max-w-xl text-lg leading-relaxed mx-auto">
                  Créez vite une room et soyez le roi de Melosphere !
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {rooms.map((room) => (
              <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="h-full relative"
              >
                {/* Notes de musique flottantes */}
                <motion.div
                  initial={{ opacity: 0, y: 20, x: -10 }}
                  animate={{ opacity: 0.7, y: -30, x: 10 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                  className="absolute -top-2 -left-2 text-violet-400 z-10"
                >
                  <IconMusic className="h-6 w-6 drop-shadow-glow" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10, x: 20 }}
                  animate={{ opacity: 0.8, y: -20, x: 30 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                  className="absolute -bottom-3 -right-3 text-indigo-300 z-10"
                >
                  <IconMusic className="h-5 w-5 drop-shadow-glow" />
                </motion.div>

                <Card className="backdrop-blur-md bg-zinc-900/40 border-violet-500/20 overflow-hidden h-full shadow-[0_0_25px_rgba(139,92,246,0.1)] flex flex-col group hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300">
                  <CardContent className="p-6 flex-grow relative">
                    {/* Effets de lumière au survol */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-300"></div>
                    
                    <div className="flex flex-col gap-4 relative">
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-semibold text-white truncate">{room.name}</h2>
                        <Badge className="bg-violet-600/50 text-white border-none px-2 py-1">
                          <IconUsers className="h-3.5 w-3.5 mr-1" />
                          {room.userCount || 1}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="h-10 w-10 border-2 border-violet-500/30 ring-2 ring-violet-500/10 ring-offset-2 ring-offset-black">
                          <AvatarImage src={getFullImageUrl(room.creator?.profilePicture)} alt={room.creator?.username || 'Utilisateur'} />
                          <AvatarFallback className="bg-violet-900/50">{room.creator?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">Créée par</span>
                          <span className="text-violet-300 text-sm">{room.creator?.username || 'Utilisateur inconnu'}</span>
                        </div>
                      </div>

                      <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-30 rounded-full mt-1"></div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-zinc-900/80 p-4 border-t border-violet-500/10">
                    <Button 
                      variant="secondary"
                      className="bg-violet-600 hover:bg-violet-700 text-white w-full py-5 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={creatingRoom || joiningRoomId === room.id}
                    >
                      {joiningRoomId === room.id ? (
                        <>
                          <div className="w-5 h-5 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <IconMusic className="h-5 w-5 mr-2 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                          Rejoindre la room
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogue pour créer une nouvelle room */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-violet-500/20">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle room</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nom de la room"
              className="bg-zinc-800 border-zinc-700"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateRoom}
              disabled={creatingRoom || !newRoomName.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {creatingRoom ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
