'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      // Fluxo PKCE: ?code= no search params (processado pelo Supabase automaticamente)
      // Fluxo implicit: #access_token= no hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.replace('/login?error=auth_failed');
        return;
      }

      // Verificar se tem walker_profile vinculado
      const { data: profile } = await supabase
        .from('walker_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        router.replace('/login?error=not_walker');
        return;
      }

      router.replace('/dashboard');
    };

    // Aguarda o Supabase processar o hash antes de chamar getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        subscription.unsubscribe();
        handle();
      } else if (event === 'SIGNED_OUT') {
        router.replace('/login?error=auth_failed');
      }
    });

    // Fallback: se já há sessão (ex: PKCE já processado)
    handle();

    return () => subscription.unsubscribe();
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
