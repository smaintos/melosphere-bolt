// app/auth/login/page.tsx

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await loginUser(email, password);
      login(data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-zinc-900/50 border-violet-500/20">
        <h1 className="text-2xl font-bold mb-6 text-center">Se connecter</h1>
        
        <form className="space-y-4" onSubmit={handleLogin}>
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
            Se connecter
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          <Link href="/auth/register" className="hover:text-violet-500">Créer un compte</Link>
          <span className="mx-2">•</span>
          <a href="#" className="hover:text-violet-500">Mot de passe oublié</a>
        </div>
      </Card>
    </div>
  );
}
