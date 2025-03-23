'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { getUserProfile, updateUserEmail, updateUserPassword, deleteUserAccount, uploadProfilePicture, getUserStats } from '@/lib/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, AlertTriangle, Settings, Camera, Shield, UserCog, Calendar, Download, Upload, AlertCircle } from "lucide-react";
import { IconLogout, IconArrowLeft } from "@tabler/icons-react";
import { eventBus, AppEvents } from '@/lib/events';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<{ downloadsCount: number, createdAt: string | null }>({ 
    downloadsCount: 0, 
    createdAt: null 
  });
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorProfilePicture, setErrorProfilePicture] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();

  // Définir API_URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const data = await getUserProfile(localStorage.getItem('token') || '');
          setProfile(data);
          setEmail(data.email);
        } catch (err: any) {
          console.error(err);
        }
      };
      
      const fetchUserStats = async () => {
        try {
          const token = localStorage.getItem('token') || '';
          const stats = await getUserStats(token);
          setUserStats(stats);
        } catch (err: any) {
          console.error('Erreur lors de la récupération des statistiques:', err);
        }
      };
      
      fetchProfile();
      fetchUserStats();
    }
  }, [user]);

  const handleUpdateEmail = async () => {
    setErrorEmail(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await updateUserEmail(token, email);
      setSuccessMessage(response.message || 'Email mis à jour avec succès.');
    } catch (err: any) {
      setErrorEmail(err.message || 'Erreur lors de la mise à jour de l&apos;email.');
    }
  };

  const handleUpdatePassword = async () => {
    setErrorPassword(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await updateUserPassword(token, password, newPassword);
      setSuccessMessage(response.message || 'Mot de passe mis à jour avec succès.');
      setPassword('');
      setNewPassword('');
    } catch (err: any) {
      setErrorPassword(err.message || 'Erreur lors de la mise à jour du mot de passe.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      await deleteUserAccount(token);
      logout();
      alert('Compte supprimé avec succès');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression du compte.');
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };
  
  const handleUploadProfilePicture = async () => {
    if (!profilePicture) return;
  
    try {
      const token = localStorage.getItem('token') || '';
      const data = await uploadProfilePicture(token, profilePicture);
  
      setProfile(data.user);
      setSuccessMessage('Photo de profil mise à jour avec succès.');
      setErrorProfilePicture(null);
      
      // Émettre un événement pour notifier les autres composants
      eventBus.publish(AppEvents.PROFILE_UPDATED, data.user);
    } catch (err: any) {
      setErrorProfilePicture(err.message || 'Erreur lors du téléchargement de la photo de profil.');
      setSuccessMessage(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-zinc-900 to-zinc-950 text-white overflow-auto">
        {/* Bouton retour */}
        <div className="fixed top-4 left-4 z-50">
          <Link href="/">
            <Button 
              variant="outline" 
              className="bg-zinc-900/70 backdrop-blur-sm hover:bg-zinc-800 border border-violet-500/30 text-white"
            >
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>

        {/* En-tête avec photo et infos de base */}
        <div className="w-full bg-gradient-to-r from-violet-900/30 to-indigo-900/30 py-20 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Photo de profil */}
            <div className="relative group">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-violet-500/50 shadow-lg shadow-violet-500/20">
                <img
                  src={profile?.profilePicture ? `${API_URL}${profile.profilePicture}` : 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="absolute bottom-2 right-2 bg-violet-600 hover:bg-violet-700 p-3 rounded-full shadow-md transition-all duration-300 group-hover:scale-110">
                    <Camera className="w-5 h-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900/95 backdrop-blur-md border-violet-500/20 rounded-xl shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl text-violet-300 font-semibold">Modifier votre photo</DialogTitle>
                    <DialogDescription className="text-center text-zinc-400 mt-1">
                      Choisissez une photo de profil pour personnaliser votre compte
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {profilePicture ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-2 border-violet-500/50 shadow-lg">
                          <img 
                            src={URL.createObjectURL(profilePicture)} 
                            alt="Aperçu" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-zinc-400 text-sm">Aperçu de votre nouvelle photo</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-zinc-800/70 border border-zinc-700 flex items-center justify-center mb-4">
                          <Upload className="h-10 w-10 text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 text-sm">Aucune photo sélectionnée</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-3">
                      <label 
                        htmlFor="profile-upload" 
                        className="cursor-pointer bg-violet-600/90 hover:bg-violet-700 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center gap-2 shadow-md shadow-violet-700/20"
                      >
                        <Upload className="w-4 h-4" />
                        {profilePicture ? 'Changer la photo' : 'Choisir une photo'}
                      </label>
                      <input 
                        id="profile-upload" 
                        type="file" 
                        onChange={handleProfilePictureChange} 
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    
                    {profilePicture && (
                      <div className="flex justify-center">
                        <Button 
                          onClick={handleUploadProfilePicture}
                          className="bg-transparent border border-violet-500/50 hover:bg-violet-800/20 text-violet-300 transition-all duration-300 rounded-full shadow-md px-8"
                        >
                          Valider
                        </Button>
                      </div>
                    )}
                    
                    {errorProfilePicture && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-2">
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errorProfilePicture}
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Badge de notification pour photo par défaut */}
              {profile?.profilePicture && profile.profilePicture.includes('/default-avatars/') && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-md">
                  1
                </div>
              )}
            </div>
            
            {/* Informations utilisateur */}
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
                {profile?.username || 'Chargement...'}
              </h1>
              <p className="text-lg text-zinc-400 mt-2">{profile?.email}</p>
              
              {/* Statistiques utilisateur */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-violet-500/30">
                  <Download size={18} className="text-violet-400" />
                  <span className="text-zinc-300">{userStats.downloadsCount} téléchargements</span>
                </div>
                
                {userStats.createdAt && (
                  <div className="flex items-center gap-2 bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-violet-500/30">
                    <Calendar size={18} className="text-violet-400" />
                    <span className="text-zinc-300">Membre depuis {new Date(userStats.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
              
              {/* Badge et alerte pour photo de profil par défaut */}
              {profile?.profilePicture && profile.profilePicture.includes('/default-avatars/') && (
                <div className="mt-4 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-3 max-w-md">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-200">Personnalisez votre profil en ajoutant une photo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Corps principal avec navigation et contenu */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Notification de succès */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p>{successMessage}</p>
            </div>
          )}
          
          {/* Navigation et sections */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Barre de navigation latérale */}
            <div className="col-span-1">
              <Card className="bg-zinc-900/50 border-violet-500/20 overflow-hidden shadow-lg shadow-violet-500/5">
                <div className="flex flex-col">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-3 p-4 hover:bg-violet-500/10 transition-colors ${activeTab === 'profile' ? 'bg-violet-500/20 border-l-4 border-violet-500' : ''}`}
                  >
                    <User className="w-5 h-5 text-violet-400" />
                    <span>Informations</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-3 p-4 hover:bg-violet-500/10 transition-colors ${activeTab === 'security' ? 'bg-violet-500/20 border-l-4 border-violet-500' : ''}`}
                  >
                    <Shield className="w-5 h-5 text-violet-400" />
                    <span>Sécurité</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('advanced')}
                    className={`flex items-center gap-3 p-4 hover:bg-violet-500/10 transition-colors ${activeTab === 'advanced' ? 'bg-violet-500/20 border-l-4 border-violet-500' : ''}`}
                  >
                    <Settings className="w-5 h-5 text-violet-400" />
                    <span>Paramètres avancés</span>
                  </button>
                </div>
              </Card>
              
              {/* Bouton de déconnexion */}
              <Button 
                variant="outline" 
                className="w-full mt-4 flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-500/20 transition-all duration-300 border border-red-500/20"
                onClick={() => {
                  logout();
                  router.push('/auth/login');
                }}
              >
                <IconLogout className="w-4 h-4 text-red-400" />
                <span>Déconnexion</span>
              </Button>
            </div>
            
            {/* Section principale */}
            <div className="col-span-1 lg:col-span-3">
              {/* Section Informations */}
              {activeTab === 'profile' && (
                <Card className="p-6 bg-zinc-900/50 border-violet-500/20 shadow-lg shadow-violet-500/5">
                  <div className="flex items-center gap-2 mb-6">
                    <UserCog className="w-5 h-5 text-violet-400" />
                    <h2 className="text-xl font-medium">Informations du profil</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm text-zinc-400 mb-2">Nom d&apos;utilisateur</h3>
                      <div className="p-3 bg-zinc-800/50 rounded-md border border-zinc-700">
                        {profile?.username}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-zinc-400 mb-2">Email</h3>
                      <div className="p-3 bg-zinc-800/50 rounded-md border border-zinc-700 flex items-center justify-between">
                        <span>{profile?.email}</span>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>Modifier</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-violet-500/20">
                            <DialogHeader>
                              <DialogTitle>Changer l&apos;email</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nouvel email"
                                className="bg-zinc-800/50 border-zinc-700"
                              />
                              <Button onClick={handleUpdateEmail} className="w-full bg-violet-600 hover:bg-violet-700">
                                Mettre à jour
                              </Button>
                              {errorEmail && <p className="text-red-500 text-sm">{errorEmail}</p>}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Section Sécurité */}
              {activeTab === 'security' && (
                <Card className="p-6 bg-zinc-900/50 border-violet-500/20 shadow-lg shadow-violet-500/5">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-violet-400" />
                    <h2 className="text-xl font-medium">Sécurité du compte</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm text-zinc-400 mb-2">Mot de passe</h3>
                      <div className="p-3 bg-zinc-800/50 rounded-md border border-zinc-700 flex items-center justify-between">
                        <span className="text-zinc-500">••••••••••••</span>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              <span>Modifier</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-violet-500/20">
                            <DialogHeader>
                              <DialogTitle>Changer le mot de passe</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Input
                                type="password"
                                placeholder="Mot de passe actuel"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700"
                              />
                              <Input
                                type="password"
                                placeholder="Nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700"
                              />
                              <Button onClick={handleUpdatePassword} className="w-full bg-violet-600 hover:bg-violet-700">
                                Mettre à jour
                              </Button>
                              {errorPassword && <p className="text-red-500 text-sm">{errorPassword}</p>}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Section Paramètres avancés */}
              {activeTab === 'advanced' && (
                <Card className="p-6 bg-zinc-900/50 border-violet-500/20 shadow-lg shadow-violet-500/5">
                  <div className="flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-violet-400" />
                    <h2 className="text-xl font-medium">Paramètres avancés</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm text-zinc-400 mb-2">Suppression du compte</h3>
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-zinc-300 mb-4">
                          La suppression de votre compte est irréversible. Toutes vos données personnelles, playlists et historique seront définitivement effacés.
                        </p>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Supprimer mon compte</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-red-500/20">
                            <DialogHeader>
                              <DialogTitle className="text-red-500">Supprimer le compte</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">
                                  Cette action est <strong>irréversible</strong>. Êtes-vous absolument sûr de vouloir supprimer votre compte ?
                                </p>
                              </div>
                              <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
                                Confirmer la suppression
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}