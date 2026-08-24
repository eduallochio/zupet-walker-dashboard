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
  const bio = typeof meta.bio === 'string' ? meta.bio : null;
  const rating = meta.rating != null ? Number(meta.rating) : null;
  const instagram = typeof meta.instagram === 'string' ? meta.instagram.replace(/^@/, '') : null;
  const whatsapp = typeof meta.whatsapp === 'string' ? meta.whatsapp.replace(/\D/g, '') : null;
  const tiktok = typeof meta.tiktok === 'string' ? meta.tiktok.replace(/^@/, '') : null;
  const location = [meta.city, meta.state].filter(Boolean).join(', ');

  type ServiceEntry = { type: string; label: string; price: number | null; price_daily: number | null };
  const services: ServiceEntry[] = Array.isArray(meta.services) ? (meta.services as ServiceEntry[]) : [];

  const SERVICE_ICONS: Record<string, string> = {
    walk: '🦮', daycare: '🏠', day_care: '🏠', boarding: '🌙', hotel: '🌙',
    bath: '🛁', vet_visit: '🏥', training: '🎯',
  };

  function fmtPrice(s: ServiceEntry): string {
    const isDaily = ['hotel', 'day_care', 'boarding', 'daycare'].includes(s.type);
    const val = isDaily && s.price_daily != null && Number(s.price_daily) > 0 ? s.price_daily : s.price;
    if (val == null) return 'Consultar';
    const n = Number(val);
    return `R$ ${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace('.', ',')}${isDaily ? '/dia' : '/sessão'}`;
  }

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
            {rating != null && (
              <div className="wk-modal-stat">
                <span className="wk-modal-stat-val">⭐ {rating.toFixed(1)}</span>
                <span className="wk-modal-stat-label">Avaliação</span>
              </div>
            )}
            {services.length > 0 && (
              <div className="wk-modal-stat">
                <span className="wk-modal-stat-val">{services.length}</span>
                <span className="wk-modal-stat-label">{services.length === 1 ? 'Serviço' : 'Serviços'}</span>
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

          {/* serviços e preços */}
          {services.length > 0 && (
            <div className="wk-modal-section">
              <h3 className="wk-modal-section-title">Serviços e valores</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {services.map((s, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--wk-modal-text, #e2e8f0)' }}>
                      <span>{SERVICE_ICONS[s.type] ?? '🐾'}</span>
                      {s.label}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80' }}>{fmtPrice(s)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* redes sociais */}
          {(instagram || whatsapp || tiktok) && (
            <div className="wk-modal-section">
              <h3 className="wk-modal-section-title">Redes sociais</h3>
              <div className="wk-modal-services">
                {instagram && (
                  <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="wk-modal-service-tag" style={{ textDecoration: 'none', color: '#f687b3' }}>
                    📸 @{instagram}
                  </a>
                )}
                {tiktok && (
                  <a href={`https://tiktok.com/@${tiktok}`} target="_blank" rel="noopener noreferrer" className="wk-modal-service-tag" style={{ textDecoration: 'none', color: '#a78bfa' }}>
                    🎵 @{tiktok}
                  </a>
                )}
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="wk-modal-service-tag" style={{ textDecoration: 'none', color: '#4ade80' }}>
                    💬 {whatsapp}
                  </a>
                )}
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
