'use client';
import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Crown, HelpCircle, Link2, Plus, Sparkles, X } from 'lucide-react';

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
    border: '1px solid rgba(134,239,172,0.16)',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14,
    color: '#EEF6F1',
    background: '#0B1512',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#8FAB9E',
    marginBottom: 6,
  };

  const cardStyle: React.CSSProperties = {
    background: '#11201B',
    border: '1px solid rgba(134,239,172,0.12)',
    borderRadius: 16,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };

  const cardTitle = (titulo: string, sub?: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#EEF6F1' }}>{titulo}</h2>
      {sub && <p style={{ fontSize: 13, color: '#A3BCB0', lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );

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
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#EEF6F1' }}>
      {/* Plano */}
      <div style={{ ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: plan === 'pro' ? 'rgba(251,191,36,0.12)' : 'rgba(34,197,94,0.12)', color: plan === 'pro' ? '#FBBF24' : '#22C55E' }}>
          {plan === 'pro' ? <Crown size={18} aria-hidden /> : <Sparkles size={18} aria-hidden />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 15 }}>{plan === 'pro' ? 'Plano Pro' : 'Plano gratuito'}</p>
          <p style={{ fontSize: 13, color: '#A3BCB0' }}>{plan === 'pro' ? 'Todos os recursos liberados' : 'Link público, serviços ilimitados e mais no Pro'}</p>
        </div>
        {plan !== 'pro' && <a href="/dashboard/pro" className="zw-btn zw-btn-ghost zw-btn-s">Conhecer o Pro</a>}
      </div>

      {/* Link público (Pro) */}
      {plan === 'pro' && (
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link2 size={18} color="#22C55E" aria-hidden />
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>Link público</h2>
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#A3BCB0', display: 'flex', alignItems: 'center' }}
                aria-label="O que é o link público?"
              >
                <HelpCircle size={16} aria-hidden />
              </button>
              {tooltipVisible && (
                <div role="tooltip" style={{
                  position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
                  background: '#152822', border: '1px solid rgba(134,239,172,0.2)', borderRadius: 10,
                  padding: '12px 14px', width: 260, zIndex: 100,
                  fontSize: 12, color: '#A3BCB0', lineHeight: 1.6,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <p style={{ fontWeight: 700, color: '#EEF6F1', marginBottom: 6 }}>O que é o link público?</p>
                  <p>Uma página só sua, como <span style={{ color: '#86EFAC', fontWeight: 700 }}>walker.zupet.io/w/seu-nome</span>, para compartilhar nas redes e mostrar serviços, avaliações e preços.</p>
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#A3BCB0', marginTop: -8 }}>
            Escolha um apelido único: letras minúsculas, números e hífens (3 a 30 caracteres).
          </p>

          <div style={{ display: 'flex', alignItems: 'center', background: '#0B1512', border: `1px solid ${usernameError ? '#FCA5A5' : 'rgba(134,239,172,0.16)'}`, borderRadius: 10, overflow: 'hidden' }}>
            <span style={{ padding: '11px 4px 11px 14px', fontSize: 13, color: '#8FAB9E', whiteSpace: 'nowrap', userSelect: 'none' }}>
              walker.zupet.io/w/
            </span>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value.toLowerCase()); setUsernameError(''); setUsernameSuccess(false); }}
              placeholder="meu-nome"
              aria-label="Apelido do link público"
              style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: '11px 14px 11px 0', fontSize: 14, color: '#EEF6F1', outline: 'none', fontFamily: 'inherit' }}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          {usernameError && <p role="alert" style={{ fontSize: 13, color: '#FCA5A5', marginTop: -8 }}>{usernameError}</p>}
          {usernameSuccess && !usernameError && (
            <p style={{ fontSize: 13, color: '#86EFAC', fontWeight: 600, marginTop: -8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Check size={14} aria-hidden /> Link salvo:
              <a href={`https://walker.zupet.io/w/${username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#86EFAC' }}>walker.zupet.io/w/{username}</a>
            </p>
          )}

          <button type="button" onClick={saveUsername} disabled={usernameSaving} className="zw-btn zw-btn-ghost zw-btn-s" style={{ alignSelf: 'flex-start' }}>
            {usernameSaving ? 'Salvando…' : 'Salvar link'}
          </button>
        </section>
      )}

      {/* Dados básicos */}
      <section style={cardStyle}>
        {cardTitle('Sobre você', 'Aparece no seu perfil para os tutores.')}
        <div>
          <label htmlFor="pf-nome" style={labelStyle}>Nome</label>
          <input id="pf-nome" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
        </div>
        <div>
          <label htmlFor="pf-bio" style={labelStyle}>Bio</label>
          <textarea id="pf-bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Conte sua experiência com pets, como são seus passeios…" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <label htmlFor="pf-tel" style={labelStyle}>Telefone</label>
            <input id="pf-tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} inputMode="tel" />
          </div>
          <div>
            <label htmlFor="pf-cidade" style={labelStyle}>Cidade</label>
            <input id="pf-cidade" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="pf-bairro" style={labelStyle}>Bairro</label>
            <input id="pf-bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={inputStyle} placeholder="Ex: Centro" />
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section style={cardStyle}>
        {cardTitle('Diferenciais', 'Frases curtas que aparecem em destaque no seu perfil público. Ex: “Rotas tranquilas e adaptadas”.')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summaryItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={item}
                onChange={e => updateSummaryItem(i, e.target.value)}
                placeholder={`Diferencial ${i + 1}`}
                aria-label={`Diferencial ${i + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              {summaryItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSummaryItem(i)}
                  aria-label={`Remover diferencial ${i + 1}`}
                  style={{ background: 'none', border: 'none', color: '#A3BCB0', cursor: 'pointer', padding: 6, display: 'inline-flex' }}
                ><X size={18} aria-hidden /></button>
              )}
            </div>
          ))}
        </div>
        {summaryItems.length < 8 && (
          <button
            type="button"
            onClick={addSummaryItem}
            className="zw-btn zw-btn-s zw-btn-ghost"
            style={{ alignSelf: 'flex-start', borderStyle: 'dashed', color: '#86EFAC' }}
          ><Plus size={14} aria-hidden /> Adicionar diferencial</button>
        )}
      </section>

      {/* Atendimento */}
      <section style={cardStyle}>
        {cardTitle('Como você atende', 'Ajuda o app a sugerir você só para tutores que combinam com seu serviço.')}
        <div>
          <label htmlFor="pf-raio" style={labelStyle}>Distância máxima de deslocamento</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input
              id="pf-raio"
              type="range"
              min={1}
              max={50}
              value={serviceRadiusKm}
              onChange={e => setServiceRadiusKm(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#22C55E' }}
            />
            <span style={{ minWidth: 52, fontWeight: 800, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>{serviceRadiusKm} km</span>
          </div>
        </div>

        <div>
          <span style={labelStyle}>Porte de cão aceito</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SIZE_OPTIONS.map(opt => {
              const active = acceptedSizes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSize(opt.value)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: `1px solid ${active ? 'rgba(34,197,94,0.5)' : 'rgba(134,239,172,0.12)'}`,
                    background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
                    color: active ? '#86EFAC' : '#A3BCB0',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >{active && <Check size={14} aria-hidden />}{opt.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 14, borderTop: '1px solid rgba(134,239,172,0.12)' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Aceito agendamentos de última hora</p>
            <p style={{ fontSize: 13, color: '#A3BCB0' }}>Tutores podem pedir passeios com menos de 24h de antecedência</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={acceptsLastMinute}
            aria-label="Aceito agendamentos de última hora"
            onClick={() => setAcceptsLastMinute(v => !v)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              background: acceptsLastMinute ? '#22C55E' : 'rgba(255,255,255,0.14)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: 3,
              left: acceptsLastMinute ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s cubic-bezier(.34,1.56,.64,1)',
              boxShadow: '0 1px 3px #0003',
            }} />
          </button>
        </div>
      </section>

      {/* Salvar */}
      <div style={{ position: 'sticky', bottom: 16, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap', padding: '12px 16px', background: 'rgba(17,32,27,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(134,239,172,0.12)', borderRadius: 14 }}>
        {error && <p role="alert" style={{ color: '#FCA5A5', fontSize: 13, marginRight: 'auto' }}>Não foi possível salvar: {error}</p>}
        {success && <p style={{ color: '#86EFAC', fontSize: 13, fontWeight: 600, marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} aria-hidden /> Perfil salvo</p>}
        <button type="submit" disabled={saving} className="zw-btn zw-btn-primary">
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}
