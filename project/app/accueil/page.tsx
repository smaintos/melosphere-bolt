'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music, Users, PlayCircle, Laptop, Monitor } from 'lucide-react';

export default function AccueilPage() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-800/20 via-zinc-900 to-black">
      {/* Éléments décoratifs */}
      <div className="fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-10 right-1/4 w-60 h-60 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>
        
        {/* Particules */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-violet-400/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7,
              transform: `scale(${Math.random() * 1.5})`,
            }}
          />
        ))}
      </div>
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full">
        {/* Hero Section */}
        <header className="relative overflow-hidden pt-16 pb-16 px-4 sm:px-6 min-h-[50vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 to-indigo-900/20 z-0" />
          
          <div className="container mx-auto max-w-7xl z-10 relative">
            <div className="flex flex-col items-center text-center">
              {/* Logo avec effet de pulse */}
              <div className="w-20 h-20 mb-8 relative">
                <div className="absolute inset-0 bg-violet-600/30 rounded-full animate-ping opacity-75 duration-1000"></div>
                <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full p-4">
                  <Music className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300 tracking-tight">
                Melosphere
              </h1>
              
              <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                La plateforme qui révolutionne le téléchargement de musique et la gestion de vos playlists
              </p>
              
              {/* Badge animé */}
              <div className="mb-12 bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/20 rounded-full px-6 py-2 text-sm font-medium text-violet-200 inline-flex items-center">
                <span className="w-2 h-2 bg-violet-400 rounded-full mr-2 animate-pulse"></span>
                Nouvelle version 1.0 disponible
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <Link href="/auth/login" className="group">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                    <Button className="relative bg-zinc-900 border-0 hover:bg-zinc-800 text-white px-10 py-7 rounded-lg text-lg font-semibold">
                      Se connecter
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </Link>
                
                <Link href="/auth/register" className="group">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 rounded-lg blur opacity-30 group-hover:opacity-80 transition duration-300"></div>
                    <Button variant="outline" className="relative border-violet-500/30 hover:bg-violet-900/20 text-white px-10 py-7 rounded-lg text-lg font-semibold">
                      S&apos;inscrire
                      <Users className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Screenshots Section */}
        <section className="relative z-10 container mx-auto px-4 sm:px-6 py-10 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
              Découvrez l&apos;expérience Melosphere
            </h2>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
              Un aperçu de ce qui vous attend après vous être connecté
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Screenshot 1 - Interface principale */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/30 to-indigo-500/30 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative border border-zinc-700/50 rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-900/90 flex items-center px-4 z-10">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="h-6 flex-1 mx-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
                    <div className="flex items-center">
                      <Laptop className="h-3 w-3 text-zinc-500 mr-2" />
                      <span className="text-xs text-zinc-500">melosphere.app/dashboard</span>
                    </div>
                  </div>
                </div>
                <Image
                  src="/demo1.png"
                  alt="Interface principale de Melosphere"
                  width={720}
                  height={450}
                  className="w-full h-auto object-contain"
                  priority={true}
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    console.error("Image non trouvée: /demo1.png");
                    e.currentTarget.style.backgroundColor = '#121212';
                    e.currentTarget.style.display = 'flex';
                    e.currentTarget.style.alignItems = 'center';
                    e.currentTarget.style.justifyContent = 'center';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
                    <Monitor className="h-16 w-16 text-violet-400" />
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="text-xl font-semibold text-white">Interface de Téléchargement</h3>
                <p className="text-zinc-400 mt-1">Téléchargez facilement votre musique préférée</p>
              </div>
            </div>
            
            {/* Screenshot 2 - Playlist */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/30 to-indigo-500/30 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative border border-zinc-700/50 rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-900/90 flex items-center px-4 z-10">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="h-6 flex-1 mx-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
                    <div className="flex items-center">
                      <Laptop className="h-3 w-3 text-zinc-500 mr-2" />
                      <span className="text-xs text-zinc-500">melosphere.app/playlists</span>
                    </div>
                  </div>
                </div>
                <Image
                  src="/demo2.png"
                  alt="Gestion des playlists Melosphere"
                  width={720}
                  height={450}
                  className="w-full h-auto object-contain"
                  priority={true}
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    console.error("Image non trouvée: /demo2.png");
                    e.currentTarget.style.backgroundColor = '#121212';
                    e.currentTarget.style.display = 'flex';
                    e.currentTarget.style.alignItems = 'center';
                    e.currentTarget.style.justifyContent = 'center';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
                    <PlayCircle className="h-16 w-16 text-violet-400" />
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="text-xl font-semibold text-white">Gestion des Playlists</h3>
                <p className="text-zinc-400 mt-1">Organisez et partagez vos playlists personnalisées</p>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/50 to-indigo-600/50 rounded-lg blur-lg opacity-70"></div>
              <Link href="/auth/register">
                <Button className="relative bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-12 py-6 rounded-lg text-xl font-semibold">
                  Commencer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
