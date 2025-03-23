"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconHome,
  IconPlaylist,
  IconLogin,
  IconUserPlus,
  IconHistory,
  IconUsers,
  IconMusic,
  IconMicrophone,
  IconMail
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getUserProfile } from "@/lib/api";
import { eventBus, AppEvents } from '@/lib/events';

export default function SidebarComponent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const data = await getUserProfile(token);
          setProfile(data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchProfile();

    // S'abonner aux mises à jour du profil
    const unsubscribe = eventBus.subscribe(AppEvents.PROFILE_UPDATED, (updatedProfile) => {
      setProfile(updatedProfile);
    });

    // Se désabonner lors du démontage du composant
    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const clearSearch = () => {
    // Effacer la recherche via la fonction globale si on est sur la page d'accueil
    if (window.resetSearch) {
      window.resetSearch();
    } else {
      // Sinon, juste nettoyer le localStorage pour le prochain chargement de la page
      localStorage.setItem('searchQuery', '');
    }
  };

  const authenticatedLinks = [
    {
      label: "Accueil",
      href: "/",
      icon: <IconHome className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0 transition-all duration-300",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Playlists",
      href: "/playlists", 
      icon: <IconPlaylist className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0 transition-all duration-300",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Historique",
      href: "/history",
      icon: <IconHistory className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0 transition-all duration-300",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Room",
      href: "/room",
      icon: <IconUsers className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0 transition-all duration-300",
        !open && "-ml-4"
      )} />
    }
  ];

  const unauthenticatedLinks = [
    {
      label: "Connexion",
      href: "/auth/login",
      icon: <IconLogin className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0 transition-all duration-300",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Inscription", 
      href: "/auth/register",
      icon: <IconUserPlus className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0 transition-all duration-300",
        !open && "-ml-4"
      )} />
    }
  ];

  const links = user ? authenticatedLinks : unauthenticatedLinks;

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="h-screen flex flex-col justify-between py-8 bg-gradient-to-b from-white to-violet-50 dark:from-zinc-900 dark:to-violet-950">
        <div className="flex flex-col h-full">
          {user && profile && (
            <div className="h-32 flex justify-center relative">
              <Link href="/profile" className="flex justify-center">
                <motion.img
                  src={profile?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${profile.profilePicture}` : 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className={cn(
                    "rounded-full border-4 border-violet-400 hover:border-violet-600 shadow-lg transition-all duration-300 z-10",
                    open ? "w-20 h-20" : "w-10 h-10"
                  )}
                  initial={false}
                  animate={{
                    width: open ? 80 : 40,
                    height: open ? 80 : 40,
                    rotate: 360
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                    rotate: {
                      duration: 10,
                      ease: "linear",
                      repeat: Infinity
                    }
                  }}
                />
                
                {/* Badge de notification pour la photo de profil par défaut */}
                {profile?.profilePicture && profile.profilePicture.includes('/default-avatars/') && (
                  <motion.div 
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-md z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    1
                  </motion.div>
                )}
              </Link>
              
              {/* Notes de musique animées */}
              <AnimatePresence>
                {open && (
                  <>
                    <MusicNote 
                      icon={<IconMusic className="text-violet-400" />} 
                      left="-10px" 
                      delay={0.5} 
                    />
                    <MusicNote 
                      icon={<IconMicrophone className="text-violet-300" />} 
                      left="100%" 
                      delay={1.2} 
                    />
                    <MusicNote 
                      icon={<IconMusic className="text-violet-500" />} 
                      left="30%" 
                      delay={2} 
                    />
                    <MusicNote 
                      icon={<IconMicrophone className="text-violet-400" />} 
                      left="70%" 
                      delay={0} 
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex flex-col gap-6 px-2 flex-1 mt-4">
            <div className="grid grid-cols-1 gap-4 transition-all duration-300">
              {links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="block w-full"
                  onClick={link.label === "Accueil" ? clearSearch : undefined}
                >
                  <div 
                    className={`w-full flex flex-col items-center justify-center p-3 ${open ? 'px-2 h-20' : 'px-4 h-16'} rounded-xl bg-zinc-800/80 hover:bg-violet-500/30 transition-all duration-300 border border-violet-500/10 shadow-md`}
                  >
                    <div className="flex items-center justify-center">
                      {React.cloneElement(link.icon as React.ReactElement, {
                        className: "transition-all duration-300 h-6 w-6"
                      })}
                    </div>
                    
                    {open && (
                      <div className="text-center text-sm font-medium text-zinc-300 mt-3">
                        {link.label}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Espace flexible pour pousser le bouton feedback vers le bas */}
          <div className="flex-grow"></div>
          
          {/* Bouton Feedback */}
          <div className="px-2 mb-4 mt-4">
            <Link href="/feedback" className="block w-full">
              <div 
                className={`w-full flex flex-col items-center justify-center p-3 ${open ? 'px-2 h-16' : 'px-4 h-12'} rounded-xl bg-zinc-800/50 hover:bg-violet-500/30 transition-all duration-300 border border-violet-500/20 shadow-md`}
              >
                <div className="flex items-center justify-center">
                  <IconMail className="text-violet-400 transition-all duration-300 h-5 w-5" />
                </div>
                
                {open && (
                  <div className="text-center text-xs font-medium text-zinc-300 mt-2">
                    Feedback
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

// Composant pour les notes de musique animées
const MusicNote = ({ 
  icon, 
  left, 
  delay 
}: { 
  icon: React.ReactNode; 
  left: string; 
  delay: number; 
}) => {
  return (
    <motion.div
      className="absolute bottom-0 w-4 h-4 opacity-80"
      style={{ left }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: -60, 
        opacity: [0, 1, 0],
        x: Math.random() * 20 - 10,
        scale: [0.8, 1.2, 1],
        rotate: Math.random() * 360
      }}
      transition={{ 
        duration: 3, 
        delay, 
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1
      }}
    >
      {icon}
    </motion.div>
  );
};
