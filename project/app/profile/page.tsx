'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { getUserProfile, updateUserEmail, updateUserPassword, deleteUserAccount, uploadProfilePicture } from '@/lib/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorProfilePicture, setErrorProfilePicture] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

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
      fetchProfile();
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
      setErrorEmail(err.message || 'Erreur lors de la mise à jour de l\'email.');
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
    } catch (err: any) {
      setErrorProfilePicture(err.message || 'Erreur lors du téléchargement de la photo de profil.');
      setSuccessMessage(null);
    }
  };
  

  return (
    <ProtectedRoute>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-zinc-900/50 border-violet-500/20">
            <div className="flex flex-col items-center space-y-6">
              {/* Photo de profil */}
              <div className="relative">
                <img
                  src={profile?.profilePicture ? `${API_URL}${profile.profilePicture}` : 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-violet-500/20"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full cursor-pointer hover:bg-violet-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Photo de profil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex flex-col items-center gap-4">
                        <label 
                          htmlFor="profile-upload" 
                          className="cursor-pointer bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md"
                        >
                          Choisir une photo
                        </label>
                        <input 
                          id="profile-upload" 
                          type="file" 
                          onChange={handleProfilePictureChange} 
                          className="hidden"
                          accept="image/*"
                        />
                        {profilePicture && (
                          <Button 
                            onClick={handleUploadProfilePicture}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                          >
                            Envoyer la photo
                          </Button>
                        )}
                        {errorProfilePicture && (
                          <p className="text-red-500 text-sm">{errorProfilePicture}</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
  
              {/* Informations utilisateur */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">{profile?.username}</h2>
                <p className="text-zinc-400">{profile?.email}</p>
              </div>
  
              {/* Boutons d'action */}
              <div className="flex gap-4 mt-6">
                {/* Dialog Email */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Changer l'email
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Changer l'email</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nouvel email"
                        className="bg-zinc-800/50"
                      />
                      <Button onClick={handleUpdateEmail} className="w-full">
                        Mettre à jour
                      </Button>
                      {errorEmail && <p className="text-red-500 text-sm">{errorEmail}</p>}
                    </div>
                  </DialogContent>
                </Dialog>
  
                {/* Dialog Mot de passe */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Changer le mot de passe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Changer le mot de passe</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        type="password"
                        placeholder="Mot de passe actuel"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-zinc-800/50"
                      />
                      <Input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-zinc-800/50"
                      />
                      <Button onClick={handleUpdatePassword} className="w-full">
                        Mettre à jour
                      </Button>
                      {errorPassword && <p className="text-red-500 text-sm">{errorPassword}</p>}
                    </div>
                  </DialogContent>
                </Dialog>
  
                {/* Dialog Suppression */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Supprimer le compte
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-500">Supprimer le compte</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-zinc-400">Cette action est irréversible. Êtes-vous sûr de vouloir supprimer votre compte ?</p>
                      <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
                        Confirmer la suppression
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
  
            {successMessage && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-400">
                {successMessage}
              </div>
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}