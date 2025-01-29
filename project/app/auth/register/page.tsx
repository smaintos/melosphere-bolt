// app/auth/register/page.tsx

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';
import { registerUser } from '@/lib/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const validateForm = (): boolean => {
    if (username.length < 4) {
      setError("Le nom d'utilisateur doit contenir au moins 4 caractères");
      return false;
    }
    
    if (username.length > 12) {
      setError("Le nom d'utilisateur ne doit pas dépasser 12 caractères");
      return false;
    }

    if (password.length < 5) {
      setError("Le mot de passe doit contenir au moins 5 caractères");
      return false;
    }

    if (!/\d/.test(password)) {
      setError("Le mot de passe doit contenir au moins un chiffre");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const data = await registerUser(username, email, password);
      login(data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 p-8 mt-48 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-zinc-900/100 border-violet-500/50">
        <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>
        
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-800/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800/50"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
            S'inscrire
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          <Link href="/auth/login" className="hover:text-violet-500">Déjà un compte ? Se connecter</Link>
        </div>
      </Card>
    </div>
  );
}
