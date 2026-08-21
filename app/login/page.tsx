'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    const e = searchParams.get('error');
    if (e === 'not_walker') setError('not_walker');
    else if (e) setError('Falha ao autenticar com provedor social. Tente novamente.');
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setError('Email ou senha incorretos.');
      setLoading(false);
      return;
    }
    // Verify walker profile exists
    const { data: profile } = await supabase
      .from('walker_profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();
    if (!profile) {
      await supabase.auth.signOut();
      setError('not_walker');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    setLoading(false);
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    setSocialLoading(null);
  };

  return (
    <div className="login-wrap">
      {/* background decoration */}
      <div className="login-bg-blob" />

      <div className="login-card">
        {/* logo */}
        <div className="login-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-simbolo-branco.png" alt="" width={24} height={24} style={{ objectFit: 'contain' }} />
          Zupet Walker
        </div>

        <h1 className="login-title">Bem-vindo de volta</h1>
        <p className="login-sub">Entre com sua conta para acessar o dashboard</p>

        {/* social buttons */}
        <div className="login-socials">
          <button
            type="button"
            className="login-social-btn"
            onClick={() => handleSocial('google')}
            disabled={!!socialLoading || loading}
          >
            {socialLoading === 'google' ? (
              <span className="login-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continuar com Google
          </button>

          <button
            type="button"
            className="login-social-btn"
            onClick={() => handleSocial('apple')}
            disabled={!!socialLoading || loading}
          >
            {socialLoading === 'apple' ? (
              <span className="login-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Continuar com Apple
          </button>
        </div>

        {/* divider */}
        <div className="login-divider">
          <span className="login-divider-line" />
          <span className="login-divider-text">ou entre com email</span>
          <span className="login-divider-line" />
        </div>

        {/* email form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              className="login-input"
            />
          </div>
          <div className="login-field">
            <label className="login-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="login-input"
            />
          </div>
          {error && (
            <div className="login-error">
              {error === 'not_walker' ? (
                <>
                  <strong>Conta não encontrada como walker.</strong>
                  <br />
                  Para usar o dashboard, você precisa ter cadastro no app Zupet Walker.{' '}
                  <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" style={{ color: '#86efac', fontWeight: 600 }}>
                    Baixe o app
                  </a>{' '}
                  e crie sua conta.
                </>
              ) : (
                error
              )}
            </div>
          )}
          <button type="submit" disabled={loading || !!socialLoading} className="login-submit">
            {loading ? <span className="login-spinner" /> : 'Entrar'}
          </button>
        </form>

        <p className="login-footer-note">
          Ainda não tem conta?{' '}
          <a href="/cadastro">
            Saiba como se tornar um walker
          </a>
        </p>
      </div>

      <style>{`
        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #0a0f0d;
          position: relative;
          overflow: hidden;
        }
        .login-bg-blob {
          position: absolute;
          top: -120px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(34,197,94,.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: #14271e;
          border: 1px solid rgba(34,197,94,.18);
          border-radius: 24px;
          padding: 40px 36px;
        }
        @media (max-width: 480px) {
          .login-card { padding: 32px 24px; border-radius: 20px; }
        }
        .login-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: -.02em;
          color: #f0faf3;
          margin-bottom: 28px;
        }
        .login-logo-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
        }
        .login-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -.025em;
          color: #f0faf3;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .login-sub {
          font-size: .88rem;
          color: #94b8a4;
          margin-bottom: 28px;
          line-height: 1.5;
        }
        .login-socials {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .login-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid rgba(240,250,243,.12);
          background: rgba(240,250,243,.04);
          color: #f0faf3;
          font-size: .9rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background .2s, border-color .2s;
        }
        .login-social-btn:hover:not(:disabled) {
          background: rgba(240,250,243,.08);
          border-color: rgba(240,250,243,.22);
        }
        .login-social-btn:disabled { opacity: .5; cursor: not-allowed; }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .login-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(240,250,243,.1);
        }
        .login-divider-text {
          font-size: .75rem;
          color: #94b8a4;
          white-space: nowrap;
          font-weight: 500;
          letter-spacing: .02em;
        }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .login-field { display: flex; flex-direction: column; gap: 6px; }
        .login-label {
          font-size: .8rem;
          font-weight: 600;
          color: #94b8a4;
          letter-spacing: .02em;
        }
        .login-input {
          width: 100%;
          background: rgba(10,15,13,.6);
          border: 1px solid rgba(240,250,243,.1);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: .92rem;
          color: #f0faf3;
          font-family: inherit;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
        }
        .login-input::placeholder { color: rgba(148,184,164,.4); }
        .login-input:focus {
          border-color: rgba(34,197,94,.5);
          box-shadow: 0 0 0 3px rgba(34,197,94,.08);
        }
        .login-error {
          font-size: .83rem;
          color: #f87171;
          background: rgba(248,113,113,.08);
          border: 1px solid rgba(248,113,113,.2);
          border-radius: 10px;
          padding: 10px 14px;
        }
        .login-submit {
          width: 100%;
          background: #22c55e;
          color: #05130a;
          font-weight: 700;
          font-size: .95rem;
          padding: 13px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background .2s, transform .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
        }
        .login-submit:hover:not(:disabled) {
          background: #86efac;
          transform: translateY(-1px);
        }
        .login-submit:disabled { opacity: .6; cursor: not-allowed; }
        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(5,19,10,.3);
          border-top-color: #05130a;
          border-radius: 50%;
          display: inline-block;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-footer-note {
          margin-top: 24px;
          text-align: center;
          font-size: .82rem;
          color: #94b8a4;
        }
        .login-footer-note a {
          color: #86efac;
          text-decoration: none;
          font-weight: 600;
        }
        .login-footer-note a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0f0d' }} />}>
      <LoginForm />
    </Suspense>
  );
}
