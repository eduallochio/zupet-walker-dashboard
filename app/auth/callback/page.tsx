'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let done = false;

    const checkProfile = async (userId: string) => {
      if (done) return;
      done = true;

      const { data: profile } = await supabase
        .from('walker_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        router.replace('/login?error=not_walker');
      } else {
        router.replace('/dashboard');
      }
    };

    // Escuta eventos do Supabase — processa hash #access_token automaticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        checkProfile(session.user.id);
      }
    });

    // Verifica se já existe sessão ativa (ex: usuário volta à página)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !done) {
        checkProfile(session.user.id);
      }
    });

    // Timeout de segurança: se nada acontecer em 8s, volta ao login
    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        router.replace('/login?error=auth_failed');
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'system-ui, sans-serif',
      color: '#94b8a4',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid rgba(34,197,94,.2)',
        borderTop: '3px solid #22c55e',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '.9rem' }}>Autenticando...</span>
    </div>
  );
}
