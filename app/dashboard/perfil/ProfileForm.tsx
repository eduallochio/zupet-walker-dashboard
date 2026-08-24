'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function ProfileForm({
  initialName,
  initialBio,
  initialPhone,
  initialCity,
  plan,
  userId,
  accessToken,
}: {
  initialName: string;
  initialBio: string;
  initialPhone: string;
  initialCity: string;
  plan: string;
  userId: string;
  accessToken: string;
}) {
  const [name,  setName]  = useState(initialName);
  const [bio,   setBio]   = useState(initialBio);
  const [phone, setPhone] = useState(initialPhone);
  const [city,  setCity]  = useState(initialCity);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    const { error: err } = await supabase
      .from('walker_profiles')
      .update({ name, bio, phone, city })
      .eq('user_id', userId);

    if (err) setError(err.message);
    else setSuccess(true);
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #D1EEEA',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14,
    color: '#0D2926',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: 6,
  };

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Plano badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#F5FAFA', borderRadius: 10, border: '1px solid #D1EEEA' }}>
        <span style={{ fontSize: 22 }}>{plan === 'pro' ? '✦' : '○'}</span>
        <div>
          <p style={{ fontWeight: 700, color: '#0D2926', fontSize: 14 }}>{plan === 'pro' ? 'Plano Pro' : 'Plano Gratuito'}</p>
          <p style={{ fontSize: 12, color: '#6B7280' }}>{plan === 'pro' ? 'Todos os recursos liberados' : 'Faça upgrade para desbloquear mais'}</p>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
      </div>
      <div>
        <label style={labelStyle}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div>
        <label style={labelStyle}>Telefone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Cidade</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
      </div>

      {error   && <p style={{ color: '#991b1b', fontSize: 13 }}>{error}</p>}
      {success && <p style={{ color: '#00A88E', fontSize: 13, fontWeight: 600 }}>Perfil salvo com sucesso!</p>}

      <button
        type="submit"
        disabled={saving}
        style={{
          background: saving ? '#9CA3AF' : '#00C6A7',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          padding: '12px 0',
          borderRadius: 10,
          border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'opacity 0.15s',
        }}
      >
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}
