// app/room/page.tsx

'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { getRoom } from '@/lib/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export default function RoomPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchRoom = async () => {
        try {
          const data = await getRoom(localStorage.getItem('token') || '');
          setMessage(data.message);
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchRoom();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Room</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 bg-zinc-900/50 border-violet-500/20 text-center">
          <Button variant="outline" className="w-full h-32 mb-4">
            <Plus className="w-8 h-8" />
          </Button>
          <h3 className="font-medium">Créer une Room</h3>
          <p className="text-sm text-zinc-400 mt-2">Écoutez de la musique avec vos amis</p>
        </Card>

        <Card className="p-6 bg-zinc-900/50 border-violet-500/20">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">Room #1</h3>
              <div className="flex items-center gap-2 text-zinc-400">
                <Users className="w-4 h-4" />
                <span className="text-sm">3</span>
              </div>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700">
              Rejoindre
            </Button>
          </div>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}
