"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconHome,
  IconPlaylist,
  IconUser,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconHistory,
  IconUsers
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getUserProfile } from "@/lib/api";

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
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Playlists",
      href: "/playlists", 
      icon: <IconPlaylist className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Historique",
      href: "/history",
      icon: <IconHistory className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Room",
      href: "/room",
      icon: <IconUsers className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0",
        !open && "-ml-4"
      )} />
    }
  ];

  const unauthenticatedLinks = [
    {
      label: "Connexion",
      href: "/auth/login",
      icon: <IconLogin className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0",
        !open && "-ml-4"
      )} />
    },
    {
      label: "Inscription", 
      href: "/auth/register",
      icon: <IconUserPlus className={cn(
        "text-violet-500 dark:text-violet-400 h-6 w-6 flex-shrink-0",
        !open && "-ml-4"
      )} />
    }
  ];

  const links = user ? authenticatedLinks : unauthenticatedLinks;

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="h-screen flex flex-col justify-between py-8 bg-gradient-to-b from-white to-violet-50 dark:from-zinc-900 dark:to-violet-950">
        <div className="flex flex-col">
          
          {user && profile && (
            <div className="h-20 flex justify-center mt-4">
              <Link href="/profile" className="flex justify-center">
                <motion.img
                  src={profile?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${profile.profilePicture}` : 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className={cn(
                    "rounded-full border-4 border-violet-400 hover:border-violet-600 shadow-lg transition-all duration-300",
                    open ? "w-20 h-20" : "w-10 h-10"
                  )}
                  initial={false}
                  animate={{
                    width: open ? 80 : 40,
                    height: open ? 80 : 40
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                />
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-6 pl-4 mt-8">
            {links.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link}
                className="text-lg font-medium hover:bg-violet-100 dark:hover:bg-violet-900 rounded-lg transition-colors duration-200 px-4 py-2"
                onClick={link.label === "Accueil" ? clearSearch : undefined}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 pl-3">
          {user && (
            <SidebarLink 
              link={{
                label: "Déconnexion",
                href: "/",
                icon: <IconLogout className={cn(
                  "text-red-500 h-6 w-6 flex-shrink-0",
                  !open && "-ml-4"
                )} />
              }}
              className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors duration-200 px-4 py-2 text-lg font-medium"
              onClick={handleLogout}
            />
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
