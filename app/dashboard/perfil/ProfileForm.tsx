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
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

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
      .eq('id', userId);

    if (err) setError(err.message);
    else setSuccess(true);
    setSaving(false);
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white';

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <span className="text-2xl">{plan === 'pro' ? '⭐' : '🆓'}</span>
        <div>
          <p className="font-semibold text-gray-800">{plan === 'pro' ? 'Plano Pro' : 'Plano Gratuito'}</p>
          <p className="text-xs text-gray-500">{plan === 'pro' ? 'Todos os recursos liberados' : 'Atualize para Pro para desbloquear mais'}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Telefone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cidade</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
      </div>

      {error   && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-emerald-600 text-sm font-medium">Perfil salvo com sucesso!</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
      >
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}
