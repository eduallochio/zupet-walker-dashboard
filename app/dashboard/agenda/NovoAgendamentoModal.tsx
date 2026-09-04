'use client';

import { useState, useEffect, useTransition } from 'react';
import { criarAgendamentoManual } from './actions';

const C = {
  bg: '#0D1F18', card: '#132219', border: 'rgba(0,200,167,0.12)',
  accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
  text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
  inputBg: '#0D1F18', danger: '#F87171',
};

const SERVICE_OPTIONS = [
  { value: 'walk',      label: 'Passeio',           emoji: '🐾' },
  { value: 'bath',      label: 'Banho e Tosa',       emoji: '🛁' },
  { value: 'boarding',  label: 'Hospedagem',         emoji: '🏠' },
  { value: 'daycare',   label: 'Day Care',           emoji: '☀️' },
  { value: 'training',  label: 'Adestramento',       emoji: '🎓' },
  { value: 'vet_visit', label: 'Visita Veterinária', emoji: '🩺' },
];

type LinkedPet = { pet_id: string; name: string; breed?: string; owner_name?: string };

type Props = { linkedPets: LinkedPet[] };

export function NovoAgendamentoBtn({ linkedPets }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: C.accent, color: '#0D1F18',
          border: 'none', borderRadius: 10,
          padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Novo agendamento
      </button>

      {open && (
        <NovoAgendamentoModal linkedPets={linkedPets} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function NovoAgendamentoModal({ linkedPets, onClose }: { linkedPets: LinkedPet[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [serviceType, setServiceType] = useState('walk');
  const [date, setDate]       = useState('');
  const [time, setTime]       = useState('08:00');
  const [duration, setDuration] = useState('60');
  const [amount, setAmount]   = useState('');
  const [notes, setNotes]     = useState('');
  const [selectedPets, setSelectedPets] = useState<Set<string>>(new Set());
  const [error, setError]     = useState('');

  // Fecha com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const togglePet = (id: string) => {
    setSelectedPets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) { setError('Selecione a data.'); return; }
    const scheduledAt = new Date(`${date}T${time}:00`);
    if (scheduledAt < new Date()) { setError('A data e hora devem ser no futuro.'); return; }
    const dur = parseInt(duration, 10);
    if (!dur || dur < 1) { setError('Informe a duração em minutos.'); return; }

    startTransition(async () => {
      const result = await criarAgendamentoManual({
        service_type:     serviceType,
        scheduled_at:     scheduledAt.toISOString(),
        duration_minutes: dur,
        amount:           amount ? parseFloat(amount.replace(',', '.')) : null,
        pet_ids:          Array.from(selectedPets),
        notes:            notes.trim() || null,
      });
      if (result?.error) { setError(result.error); return; }
      onClose();
    });
  };

  const hasLinkedOwner = linkedPets.some((p) => selectedPets.has(p.pet_id) && p.owner_name);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          zIndex: 50,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 51,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        padding: '24px 28px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Novo agendamento
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: C.textSec, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tipo de serviço */}
          <div>
            <Label>Tipo de serviço</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {SERVICE_OPTIONS.map((opt) => {
                const active = opt.value === serviceType;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setServiceType(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: `1px solid`,
                      borderColor: active ? C.accent : C.border,
                      background: active ? C.accentDim : 'transparent',
                      color: active ? C.accent : C.textSec,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{opt.emoji}</span> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data e hora */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Data</Label>
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <Label>Hora</Label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Duração e valor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Duração (min)</Label>
              <input
                type="number"
                min={1}
                max={1440}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                style={inputStyle}
              />
            </div>
            <div>
              <Label>Valor (R$) <span style={{ fontWeight: 400, opacity: 0.6 }}>opcional</span></Label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Pets */}
          {linkedPets.length > 0 && (
            <div>
              <Label>Pets <span style={{ fontWeight: 400, opacity: 0.6 }}>opcional</span></Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {linkedPets.map((pet) => {
                  const sel = selectedPets.has(pet.pet_id);
                  return (
                    <button
                      key={pet.pet_id}
                      type="button"
                      onClick={() => togglePet(pet.pet_id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${sel ? C.accent : C.border}`,
                        background: sel ? C.accentDim : 'transparent',
                        textAlign: 'left', width: '100%',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🐶</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{pet.name}</div>
                        {pet.owner_name && (
                          <div style={{ fontSize: 11, color: C.accent, marginTop: 1 }}>
                            👤 {pet.owner_name} · tutor no Zupet
                          </div>
                        )}
                      </div>
                      {sel && <span style={{ color: C.accent, fontSize: 16 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {hasLinkedOwner && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
                  padding: '8px 12px', borderRadius: 8,
                  background: C.accentDim, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.accent,
                }}>
                  🔔 O tutor será notificado sobre este agendamento.
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          <div>
            <Label>Observações <span style={{ fontWeight: 400, opacity: 0.6 }}>opcional</span></Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações sobre o serviço..."
              maxLength={300}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Erro */}
          {error && (
            <div style={{ fontSize: 13, color: C.danger, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.textSec, cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                background: isPending ? C.textMuted : C.accent,
                color: '#0D1F18', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Salvando...' : '📅 Criar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: C.textSec,
      textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px', borderRadius: 9,
  background: C.inputBg, border: `1px solid ${C.border}`,
  color: C.text, fontSize: 13, fontWeight: 500,
  outline: 'none',
};
