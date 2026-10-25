
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function run(mode: 'signup' | 'signin') {
    if (!supabase) {
      setMsg('Configure as variáveis Supabase antes de usar.');
      return;
    }

    const r =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (r.error) {
      setMsg(r.error.message);
      return;
    }

    if (mode === 'signup' && !r.data.session) {
      setMsg('Conta criada. Confirme seu e-mail para entrar.');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main>
      <h1>Minha conta</h1>

      <div className="panel" style={{ maxWidth: 440 }}>
        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%' }}
        />

        <label>Senha (mínimo 6 caracteres)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%' }}
        />

        <div className="flex" style={{ marginTop: 18 }}>
          <button onClick={() => run('signin')}>Entrar</button>
          <button onClick={() => run('signup')}>Criar conta</button>
        </div>

        <p role="status">{msg}</p>
      </div>
    </main>
  );
}
