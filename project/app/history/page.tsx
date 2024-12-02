"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function HistoryPage() {
  return (
    <ProtectedRoute>
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Historique</h1>
      
      <div className="grid gap-4">
        <Card className="p-4 bg-zinc-900/50 border-violet-500/20">
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-zinc-400" />
            <div>
              <h3 className="font-medium">Titre de la musique</h3>
              <p className="text-sm text-zinc-400">Écouté il y a 2 heures</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </ProtectedRoute>
  );
}