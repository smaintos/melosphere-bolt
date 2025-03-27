'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    // Seulement se connecter si l'utilisateur est authentifié
    if (user) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://87.106.162.205:5001';
      console.log("Tentative de connexion Socket.IO:", socketUrl);

      const socketInstance = io(socketUrl, {
        auth: {
          userId: user.id
        },
        // Toujours utiliser le polling pour une meilleure compatibilité
        transports: ['polling'],
        // Configuration améliorée pour une meilleure stabilité
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        // Forcer une reconnexion plus agressive
        forceNew: true,
        autoConnect: true
      });
      
      socketInstance.on('connect', () => {
        console.log('Socket.IO connecté avec succès, ID:', socketInstance.id);
        setIsConnected(true);
      });
      
      socketInstance.on('disconnect', (reason) => {
        console.log('Socket.IO déconnecté, raison:', reason);
        setIsConnected(false);
        
        // Tenter de se reconnecter automatiquement après 2 secondes
        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(() => {
            console.log('Tentative de reconnexion Socket.IO...');
            socketInstance.connect();
          }, 2000);
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Erreur de connexion Socket.IO:', error.message);
        
        // Tenter de se reconnecter automatiquement après 3 secondes en cas d'erreur
        setTimeout(() => {
          console.log('Nouvelle tentative de connexion Socket.IO après erreur...');
          socketInstance.connect();
        }, 3000);
      });
      
      setSocket(socketInstance);
      
      return () => {
        console.log('Déconnexion de Socket.IO depuis Context');
        socketInstance.disconnect();
      };
    }
    
    return () => {
      if (socket) {
        console.log('Nettoyage de la connexion Socket.IO');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user]);
  
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 