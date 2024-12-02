"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListMusic, History, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useAuth from "@/app/hooks/useAuth"; // Importer le hook d'authentification

type StatusType = "Actif" | "Ne pas déranger" | "Inactif" | "Absent";

const routes = [
  {
    label: "Accueil",
    icon: Home,
    href: "/",
  },
  {
    label: "Playlists",
    icon: ListMusic,
    href: "/playlists",
  },
  {
    label: "Historique",
    icon: History,
    href: "/history",
  },
  {
    label: "Room",
    icon: Users,
    href: "/room",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<StatusType>("Actif");
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth(); // Obtenir la méthode logout depuis le contexte

  const statusColors: Record<StatusType, string> = {
    Actif: "bg-green-500",
    "Ne pas déranger": "bg-red-500",
    Inactif: "bg-gray-500",
    Absent: "bg-yellow-500",
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout(); // Appeler la méthode de déconnexion
  };

  return (
    <div className="relative flex flex-col bg-zinc-900 border-r border-zinc-800 w-16 h-screen">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center">
        <span className="text-violet-500 font-bold">M</span>
      </div>

      {/* Spacer pour descendre les catégories */}
      <div className="mt-32"></div>

      {/* Navigation */}
      <div className="flex-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center py-3 px-4 relative group",
              pathname === route.href
                ? "text-violet-500"
                : "text-zinc-400 hover:text-white",
              "justify-center"
            )}
          >
            <route.icon className="w-5 h-5 flex-shrink-0" />
            {/* Infobulle pour le label */}
            <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
              {route.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Photo de profil, état de connexion et déconnexion */}
      <div className="p-4 flex flex-col items-center relative">
        <div className="relative">
          {/* Avatar */}
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          {/* Indicateur de statut */}
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 cursor-pointer",
              statusColors[status],
              "transition-all duration-300 ease-in-out hover:scale-125"
            )}
            onClick={toggleMenu}
          ></span>
        </div>

        {/* Menu déroulant */}
        {menuOpen && (
          <div className="absolute bottom-12 left-full ml-2 mt-1 bg-zinc-800 text-white text-sm rounded shadow-lg w-48 z-50">
            {/* Statut */}
            {Object.keys(statusColors).map((state) => (
              <button
                key={state}
                className={cn(
                  "px-4 py-2 hover:bg-zinc-700 w-full text-left",
                  status === state ? "text-violet-500" : "text-white"
                )}
                onClick={() => {
                  setStatus(state as StatusType); // Cast explicite pour TypeScript
                  setMenuOpen(false);
                }}
              >
                {state}
              </button>
            ))}

            {/* Bouton Déconnexion */}
            <button
              className="px-4 py-2 hover:bg-red-600 w-full text-left text-red-500 hover:text-white flex items-center gap-2"
              onClick={handleLogout} // Utiliser la fonction de déconnexion
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
