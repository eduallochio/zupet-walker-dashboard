'use client';
import { useEffect } from 'react';
import { ChromaItem } from './chroma-grid';

interface WalkerModalProps {
  item: ChromaItem | null;
  onClose: () => void;
}

const SERVICE_LABELS: Record<string, string> = {
  walk: 'Passeio',
  daycare: 'Day Care',
  boarding: 'Hospedagem',
  bath: 'Banho',
  vet: 'Veterinário',
  training: 'Adestramento',
};

export function WalkerModal({ item, onClose }: WalkerModalProps) {
  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const meta = item.meta ?? {};
  const services: string[] = Array.isArray(meta.services) ? (meta.services as string[]) : [];
  const bio = typeof meta.bio === 'string' ? meta.bio : null;
  const rating = meta.rating != null ? Number(meta.rating) : null;
  const price = meta.price_per_hour != null ? Number(meta.price_per_hour) : null;
  const experience = meta.experience_years != null ? Number(meta.experience_years) : null;
  const location = [meta.city, meta.state].filter(Boolean).join(', ');

  return (
    <div className="wk-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="wk-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: item.borderColor ?? 'rgba(34,197,94,.3)' }}
      >
        {/* header */}
        <div className="wk-modal-header" style={{ background: item.gradient }}>
          <img src={item.image} alt={item.title} className="wk-modal-avatar" />
          <div className="wk-modal-identity">
            <h2 className="wk-modal-name">{item.title}</h2>
            {location && <p className="wk-modal-location">📍 {location}</p>}
            {rating != null && (
              <p className="wk-modal-rating">⭐ {rating.toFixed(1)} de avaliação</p>
            )}
          </div>
          <button className="wk-modal-close" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="wk-modal-body">
          {/* quick stats */}
          <div className="wk-modal-stats">
            {price != null && (
              <div className="wk-modal-stat">
                <span className="wk-modal-stat-val">R$ {price.toFixed(0)}/h</span>
                <span className="wk-modal-stat-label">Valor hora</span>
              </div>
            )}
            {experience != null && (
              <div className="wk-modal-stat">
                <span className="wk-modal-stat-val">{experience} {experience === 1 ? 'ano' : 'anos'}</span>
                <span className="wk-modal-stat-label">Experiência</span>
              </div>
            )}
            {rating != null && (
              <div className="wk-modal-stat">
                <span className="wk-modal-stat-val">⭐ {rating.toFixed(1)}</span>
                <span className="wk-modal-stat-label">Avaliação</span>
              </div>
            )}
          </div>

          {/* bio */}
          {bio && (
            <div className="wk-modal-section">
              <h3 className="wk-modal-section-title">Sobre</h3>
              <p className="wk-modal-bio">{bio}</p>
            </div>
          )}

          {/* services */}
          {services.length > 0 && (
            <div className="wk-modal-section">
              <h3 className="wk-modal-section-title">Serviços</h3>
              <div className="wk-modal-services">
                {services.map((s) => (
                  <span key={s} className="wk-modal-service-tag">
                    {SERVICE_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="wk-modal-cta-note">
            Para contratar este walker,{' '}
            <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="wk-modal-cta-link">
              baixe o app Zupet
            </a>{' '}
            e conecte-se diretamente.
          </p>
        </div>
      </div>
    </div>
  );
}
