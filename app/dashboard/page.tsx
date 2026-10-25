
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      if (!supabase) {
        router.replace('/');
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace('/');
        return;
      }

      setEmail(data.user.email ?? '');
      setLoading(false);
    }

    checkUser();
  }, [router]);

  if (loading) {
    return <main><p>Carregando sua coleção...</p></main>;
  }

  return (
    <main>
      <h1>Minha coleção Pokémon TCG</h1>
      <p>Bem-vindo à sua Pokédex!</p>
      <p>Conta: {email}</p>
      <p>Seu painel está funcionando.</p>
    </main>
  );
}
