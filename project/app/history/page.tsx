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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 md:mb-8 text-white">Historique</h1>
  
        <div className="grid gap-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-400 mb-2">Aucun téléchargement dans l&apos;historique</p>
              <p className="text-zinc-500 text-sm">Vos téléchargements apparaîtront ici</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tri par date décroissante et limite à 6 items */}
              {history
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 6)
                .map((item) => (
                  <Card key={item.id} className="p-4 bg-zinc-900/50 border-violet-500/20 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
                      <p className="text-violet-400 text-sm line-clamp-1">{item.channel}</p>
                      <p className="text-zinc-400 text-sm">
                        {format(new Date(item.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}