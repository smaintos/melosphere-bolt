'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getHistory } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface HistoryItem {
  id: number;
  title: string;
  channel : string;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token manquant');
        
        const data = await getHistory(token);
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (isLoading) {
    return <div className="text-white">Chargement de l'historique...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Historique</h1>
  
        <div className="grid gap-4">
          {history.length === 0 ? (
            <p className="text-zinc-400">Aucun téléchargement dans l'historique</p>
          ) : (
            // Tri par date décroissante et limite à 6 items
            history
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 6)
              .map((item) => (
                <Card key={item.id} className="p-4 bg-zinc-900/50 border-violet-500/20">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-violet-400 text-sm">{item.channel}</p>
                    <p className="text-zinc-400 text-sm">
                      {format(new Date(item.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}