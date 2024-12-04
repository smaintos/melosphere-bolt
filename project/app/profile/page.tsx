'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { getUserProfile, updateUserEmail, updateUserPassword, deleteUserAccount, uploadProfilePicture } from '@/lib/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

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
        <h1 className="text-3xl font-bold mb-8 text-white">Profil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-zinc-900/50 border-violet-500/20 text-center">
            <img
              src={profile?.profilePicture ? `${API_URL}${profile.profilePicture}` : 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <input type="file" onChange={handleProfilePictureChange} className="mb-4" />
            <Button onClick={handleUploadProfilePicture} className="bg-violet-600 hover:bg-violet-700">
              Mettre à jour la photo de profil
            </Button>
            {errorProfilePicture && <p className="text-red-500 text-sm mb-2">{errorProfilePicture}</p>}
            {profile ? (
              <div>
                <h2 className="text-xl font-bold">{profile.username}</h2>
                <p className="text-sm text-gray-400">{profile.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Chargement...</p>
            )}
          </Card>

          <Card className="p-6 bg-zinc-900/50 border-violet-500/20">
            <h2 className="text-xl font-bold mb-4">Modifier l'Email</h2>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-2"
            />
            {errorEmail && <p className="text-red-500 text-sm mb-2">{errorEmail}</p>}
            <Button onClick={handleUpdateEmail} className="bg-violet-600 hover:bg-violet-700">
              Mettre à jour l'Email
            </Button>
          </Card>

          <Card className="p-6 bg-zinc-900/50 border-violet-500/20">
            <h2 className="text-xl font-bold mb-4">Modifier le Mot de Passe</h2>
            <Input
              type="password"
              placeholder="Mot de passe actuel"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-2"
            />
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-2"
            />
            {errorPassword && <p className="text-red-500 text-sm mb-2">{errorPassword}</p>}
            <Button onClick={handleUpdatePassword} className="bg-violet-600 hover:bg-violet-700">
              Mettre à jour le Mot de Passe
            </Button>
          </Card>

          <Card className="p-6 bg-zinc-900/50 border-violet-500/20">
            <h2 className="text-xl font-bold mb-4">Supprimer le Compte</h2>
            <Button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
              Supprimer le Compte
            </Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}