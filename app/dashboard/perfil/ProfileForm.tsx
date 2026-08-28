'use client';
import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SIZE_OPTIONS = [
  { value: 'small',  label: 'Pequeno (1–5 kg)' },
  { value: 'medium', label: 'Médio (5–15 kg)' },
  { value: 'large',  label: 'Grande (15–30 kg)' },
  { value: 'xlarge', label: 'Gigante (30+ kg)' },
];

export default function ProfileForm({
  initialName,
  initialBio,
  initialPhone,
  initialCity,
  initialNeighborhood,
  plan,
  initialSummaryItems,
  initialServiceRadiusKm,
  initialAcceptedSizes,
  initialAcceptsLastMinute,
  initialUsername,
  userId,
  accessToken,
}: {
  initialName: string;
  initialBio: string;
  initialPhone: string;
  initialCity: string;
  initialNeighborhood: string;
  plan: string;
  initialSummaryItems: string[];
  initialServiceRadiusKm: number;
  initialAcceptedSizes: string[];
  initialAcceptsLastMinute: boolean;
  initialUsername: string;
  userId: string;
  accessToken: string;
}) {
  const [name,               setName]               = useState(initialName);
  const [bio,                setBio]                = useState(initialBio);
  const [phone,              setPhone]              = useState(initialPhone);
  const [city,               setCity]               = useState(initialCity);
  const [neighborhood,       setNeighborhood]       = useState(initialNeighborhood);
  const [summaryItems,       setSummaryItems]       = useState<string[]>(initialSummaryItems.length ? initialSummaryItems : ['']);
  const [serviceRadiusKm,    setServiceRadiusKm]    = useState(initialServiceRadiusKm);
  const [acceptedSizes,      setAcceptedSizes]      = useState<string[]>(initialAcceptedSizes);
  const [acceptsLastMinute,  setAcceptsLastMinute]  = useState(initialAcceptsLastMinute);
  const [username,           setUsername]           = useState(initialUsername ?? '');
  const [usernameError,      setUsernameError]      = useState('');
  const [usernameSaving,     setUsernameSaving]     = useState(false);
  const [usernameSuccess,    setUsernameSuccess]    = useState(false);
  const [tooltipVisible,     setTooltipVisible]     = useState(false);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const saveUsername = async () => {
    const clean = username.trim().toLowerCase();
    if (clean && !/^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$/.test(clean)) {
      setUsernameError('Use apenas letras minúsculas, números e hífens (3–30 caracteres).');
      return;
    }
    setUsernameError('');
    setUsernameSaving(true);
    setUsernameSuccess(false);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );
    const { error: err } = await supabase
      .from('walker_profiles')
      .update({ username: clean || null })
      .eq('user_id', userId);
    if (err) setUsernameError(err.message);
    else setUsernameSuccess(true);
    setUsernameSaving(false);
  };

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

    const cleanSummary = summaryItems.map(s => s.trim()).filter(Boolean);

    const { error: err } = await supabase
      .from('walker_profiles')
      .update({
        name,
        bio,
        phone,
        city,
        neighborhood,
        summary_items: cleanSummary,
        service_radius_km: serviceRadiusKm,
        accepted_sizes: acceptedSizes,
        accepts_last_minute: acceptsLastMinute,
      })
      .eq('user_id', userId);

    if (err) setError(err.message);
    else setSuccess(true);
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid rgba(0,200,167,0.2)',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14,
    color: '#E8F5F0',
    background: '#0D2E22',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#7FA898',
    marginBottom: 6,
  };

  const sectionStyle: React.CSSProperties = {
    padding: '18px 0 0',
    borderTop: '1px solid rgba(0,200,167,0.12)',
    marginTop: 4,
  };

  const toggleSize = (size: string) => {
    setAcceptedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const updateSummaryItem = (index: number, value: string) => {
    setSummaryItems(prev => prev.map((s, i) => i === index ? value : s));
  };

  const addSummaryItem = () => setSummaryItems(prev => [...prev, '']);
  const removeSummaryItem = (index: number) => setSummaryItems(prev => prev.filter((_, i) => i !== index));

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#E8F5F0' }}>
      {/* Plano badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#132219', borderRadius: 10, border: '1px solid rgba(0,200,167,0.12)' }}>
        <span style={{ fontSize: 22 }}>{plan === 'pro' ? '✦' : '○'}</span>
        <div>
          <p style={{ fontWeight: 700, color: '#E8F5F0', fontSize: 14 }}>{plan === 'pro' ? 'Plano Pro' : 'Plano Gratuito'}</p>
          <p style={{ fontSize: 12, color: '#7FA898' }}>{plan === 'pro' ? 'Todos os recursos liberados' : 'Faça upgrade para desbloquear mais'}</p>
        </div>
      </div>

      {/* Username Pro */}
      {plan === 'pro' && (
        <div style={{ padding: '18px 20px', background: '#132219', borderRadius: 14, border: '1.5px solid rgba(0,198,167,0.25)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header com tooltip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#E8F5F0' }}>🔗 Link público personalizado</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#00C6A7', background: 'rgba(0,198,167,0.12)', border: '1px solid rgba(0,198,167,0.3)', borderRadius: 20, padding: '2px 8px' }}>Pro</span>
            {/* Ícone de ajuda com tooltip */}
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                onMouseEnter={() => {
                  if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
                  setTooltipVisible(true);
                }}
                onMouseLeave={() => {
                  tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 200);
                }}
                onFocus={() => setTooltipVisible(true)}
                onBlur={() => setTooltipVisible(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#7FA898', display: 'flex', alignItems: 'center' }}
                aria-label="O que é o link público?"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </button>
              {tooltipVisible && (
                <div style={{
                  position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
                  background: '#0D2E22', border: '1px solid rgba(0,198,167,0.25)', borderRadius: 10,
                  padding: '12px 14px', width: 260, zIndex: 100,
                  fontSize: 12, color: '#b0cfc5', lineHeight: 1.6,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <p style={{ fontWeight: 700, color: '#E8F5F0', marginBottom: 6 }}>O que é o link público?</p>
                  <p>É uma página exclusiva sua na internet, como:</p>
                  <p style={{ color: '#00C6A7', fontWeight: 600, margin: '6px 0' }}>walker.zupet.io/w/<strong>seu-nome</strong></p>
                  <p>Você pode compartilhar nas redes sociais para mostrar seus serviços, avaliações e preços para potenciais clientes.</p>
                  <div style={{ position: 'absolute', bottom: -6, left: '50%', width: 10, height: 10, background: '#0D2E22', border: '1px solid rgba(0,198,167,0.25)', borderTop: 'none', borderLeft: 'none', transform: 'translateX(-50%) rotate(45deg)' }} />
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#7FA898', marginTop: -8 }}>
            Defina um apelido único para seu perfil público. Use letras minúsculas, números e hífens (3–30 caracteres).
          </p>

          {/* Input de username */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#0D2E22', border: `1.5px solid ${usernameError ? '#F87171' : 'rgba(0,200,167,0.2)'}`, borderRadius: 10, overflow: 'hidden' }}>
            <span style={{ padding: '11px 10px 11px 14px', fontSize: 13, color: '#7FA898', whiteSpace: 'nowrap', userSelect: 'none' }}>
              walker.zupet.io/w/
            </span>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value.toLowerCase()); setUsernameError(''); setUsernameSuccess(false); }}
              placeholder="meu-nome"
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '11px 14px 11px 0', fontSize: 14, color: '#E8F5F0', outline: 'none', fontFamily: 'inherit' }}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          {usernameError && <p style={{ fontSize: 12, color: '#F87171', marginTop: -8 }}>{usernameError}</p>}
          {usernameSuccess && !usernameError && (
            <p style={{ fontSize: 12, color: '#22D3A5', fontWeight: 600, marginTop: -8 }}>
              ✓ Link salvo! Acesse: <a href={`https://zupet-walker-dashboard-b9al.vercel.app/w/${username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#00C6A7' }}>zupet-walker-dashboard-b9al.vercel.app/w/{username}</a>
            </p>
          )}

          <button
            type="button"
            onClick={saveUsername}
            disabled={usernameSaving}
            style={{
              alignSelf: 'flex-start',
              background: usernameSaving ? '#9CA3AF' : '#00C6A7',
              color: '#fff', fontWeight: 700, fontSize: 13,
              padding: '9px 20px', borderRadius: 8, border: 'none',
              cursor: usernameSaving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {usernameSaving ? 'Salvando...' : 'Salvar link'}
          </button>
        </div>
      )}

      {/* Dados básicos */}
      <div>
        <label style={labelStyle}>Nome</label>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
      </div>
      <div>
        <label style={labelStyle}>Bio</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div>
        <label style={labelStyle}>Telefone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Cidade</label>
          <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Bairro</label>
          <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={inputStyle} placeholder="Ex: Centro" />
        </div>
      </div>

      {/* Diferenciais */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Diferenciais do seu serviço</label>
        <p style={{ fontSize: 12, color: '#7FA898', marginBottom: 12 }}>Escreva bullet points que aparecem no seu perfil público (ex: "Rotas tranquilas e adaptadas")</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summaryItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={item}
                onChange={e => updateSummaryItem(i, e.target.value)}
                placeholder={`Diferencial ${i + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              {summaryItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSummaryItem(i)}
                  style={{ background: 'none', border: 'none', color: '#7FA898', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}
                >×</button>
              )}
            </div>
          ))}
        </div>
        {summaryItems.length < 8 && (
          <button
            type="button"
            onClick={addSummaryItem}
            style={{ marginTop: 8, background: 'none', border: '1px dashed rgba(0,200,167,0.3)', borderRadius: 8, padding: '8px 14px', color: '#00C6A7', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >+ Adicionar diferencial</button>
        )}
      </div>

      {/* Distância */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Distância máxima de deslocamento</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input
            type="range"
            min={1}
            max={50}
            value={serviceRadiusKm}
            onChange={e => setServiceRadiusKm(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#00C6A7' }}
          />
          <span style={{ minWidth: 52, fontWeight: 700, color: '#E8F5F0', fontSize: 15 }}>{serviceRadiusKm} km</span>
        </div>
      </div>

      {/* Porte aceito */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Porte de cão aceito</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {SIZE_OPTIONS.map(opt => {
            const active = acceptedSizes.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleSize(opt.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `1.5px solid ${active ? '#00C6A7' : 'rgba(0,200,167,0.15)'}`,
                  background: active ? 'rgba(0,198,167,0.15)' : '#0D2E22',
                  color: active ? '#00C6A7' : '#7FA898',
                  fontWeight: active ? 700 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >{opt.label}</button>
            );
          })}
        </div>
      </div>

      {/* Última hora */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, color: '#E8F5F0', fontSize: 14, marginBottom: 2, WebkitTextFillColor: '#E8F5F0' }}>Aceita agendamentos de última hora</p>
            <p style={{ fontSize: 12, color: '#7FA898', WebkitTextFillColor: '#7FA898' }}>Tutores podem solicitar passeios com menos de 24h de antecedência</p>
          </div>
          <button
            type="button"
            onClick={() => setAcceptsLastMinute(v => !v)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              background: acceptsLastMinute ? '#00C6A7' : '#D1D5DB',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: 3,
              left: acceptsLastMinute ? 22 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px #0002',
            }} />
          </button>
        </div>
      </div>

      {error   && <p style={{ color: '#F87171', fontSize: 13 }}>{error}</p>}
      {success && <p style={{ color: '#22D3A5', fontSize: 13, fontWeight: 600 }}>Perfil salvo com sucesso!</p>}

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
