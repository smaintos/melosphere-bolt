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

  const authenticatedLinks = [
    {
      label: "Accueil",
      href: "/",
      icon: <IconHome className="text-neutral-700 dark:text-white h-6 w-6 flex-shrink-0" />
    },
    {
      label: "Playlists",
      href: "/playlists",
      icon: <IconPlaylist className="text-neutral-700 dark:text-white h-6 w-6 flex-shrink-0" />
    },
    {
      label: "Historique",
      href: "/history",
      icon: <IconHistory className="text-neutral-700 dark:text-white h-6 w-6 flex-shrink-0" />
    },
    {
      label: "Room",
      href: "/room",
      icon: <IconUsers className="text-neutral-700 dark:text-white h-6 w-6 flex-shrink-0" />
    }
  ];

  const unauthenticatedLinks = [
    {
      label: "Connexion",
      href: "/auth/login",
      icon: <IconLogin className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
    },
    {
      label: "Inscription",
      href: "/auth/register",
      icon: <IconUserPlus className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
    }
  ];

  const links = user ? authenticatedLinks : unauthenticatedLinks;

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="h-screen flex flex-col justify-between py-8">
        <div className="flex flex-col">
          {open ? <Logo /> : <LogoIcon />}

          <div className="flex flex-col gap-6 pl-4 mt-60">
            {links.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link}
                className="text-lg"
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
                icon: <IconLogout className="text-red-500 h-6 w-6 flex-shrink-0" />
              }}
              className="text-red-500 hover:text-red-600 text-lg"
              onClick={handleLogout}
            />
          )}

          {user && profile && (
            <Link href="/profile" className="flex justify-center">
              <motion.img
                src={profile?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${profile.profilePicture}` : 'https://via.placeholder.com/40'}
                alt="Profile"
                className={cn(
                  "rounded-full border-2 border-transparent hover:border-violet-500 transition-all duration-300",
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
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

    const Logo = () => {
      return (
        <Link href="/" className="font-normal flex items-center text-sm text-black py-1 relative z-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-medium text-black dark:text-white whitespace-pre pl-20"
          >
            MeloSphere
          </motion.span>
        </Link>
      );
    };

    const LogoIcon = () => {
      return (
        <Link href="/" className="font-normal flex items-center text-sm text-black py-1 relative z-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-medium text-black dark:text-white whitespace-pre pl-5"
          >
            M
          </motion.span>
        </Link>
      );
    };