'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '../hooks/useAuth';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconMusicPlus, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

  // Rejoindre une room
  const handleJoinRoom = async (roomId: string) => {
    try {
      await roomsApi.joinRoom(roomId);
      router.push(`/room/${roomId}`);
    } catch (err) {
      console.error('Erreur lors de la connexion à la room:', err);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre la room. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute>
      {/* Bouton retour */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/">
          <Button 
            variant="outline" 
            className="bg-zinc-900/70 backdrop-blur-sm hover:bg-zinc-800 border border-violet-500/30 text-white"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>
    
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center min-h-screen pt-20 md:pt-24">
        <div className="text-center mb-8 md:mb-10 w-full max-w-6xl">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Rooms d&apos;écoute
            </h1>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <IconMusicPlus className="h-4 w-4 mr-2" />
              Créer une room
            </Button>
          </div>
          <p className="text-zinc-400 mt-2">
            Créez ou rejoignez une room pour écouter de la musique avec d&apos;autres utilisateurs
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center w-full">
            <div className="w-12 h-12 border-4 border-t-violet-500 border-violet-200 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <Card className="w-full max-w-2xl p-4 md:p-8 bg-zinc-900/50 border-violet-500/20">
            <p className="text-red-500">{error}</p>
          </Card>
        ) : rooms.length === 0 ? (
          <Card className="w-full max-w-2xl p-4 md:p-8 bg-zinc-900/50 border-violet-500/20">
            <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                Aucune room active
              </h2>
              <p className="text-zinc-400">
                Créez votre première room pour commencer à écouter de la musique avec d&apos;autres utilisateurs.
              </p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="mt-2 bg-violet-600 hover:bg-violet-700"
              >
                Créer une room
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {rooms.map((room) => (
              <Card key={room.id} className="bg-zinc-900/70 border-violet-500/20 overflow-hidden hover:border-violet-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xl font-semibold text-white truncate">{room.name}</h2>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getFullImageUrl(room.creator?.profilePicture)} alt={room.creator?.username || 'Utilisateur'} />
                        <AvatarFallback>{room.creator?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-zinc-400">Créée par {room.creator?.username || 'Utilisateur inconnu'}</span>
                    </div>
                    <Badge variant="outline" className="w-fit flex items-center gap-1 bg-zinc-800/50">
                      <IconUsers className="h-3 w-3" />
                      <span>{room.userCount || 1} utilisateur{(room.userCount || 1) > 1 ? 's' : ''}</span>
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-zinc-800/30 p-4">
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    Rejoindre
                  </Button>
                </CardFooter>
              </Card>
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
