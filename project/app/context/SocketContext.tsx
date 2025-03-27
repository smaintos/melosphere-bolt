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
      const socketInstance = io(socketUrl, {
        auth: {
          userId: user.id
        }
      });
      
      socketInstance.on('connect', () => {
        console.log('Socket.IO connecté');
        setIsConnected(true);
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Socket.IO déconnecté');
        setIsConnected(false);
      });
      
      setSocket(socketInstance);
      
      return () => {
        socketInstance.disconnect();
      };
    }
    
    return () => {
      if (socket) {
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