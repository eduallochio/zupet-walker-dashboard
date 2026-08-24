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
  const price = meta.price != null ? Number(meta.price) : null;
  const instagram = typeof meta.instagram === 'string' ? meta.instagram.replace(/^@/, '') : null;
  const whatsapp = typeof meta.whatsapp === 'string' ? meta.whatsapp.replace(/\D/g, '') : null;
  const tiktok = typeof meta.tiktok === 'string' ? meta.tiktok.replace(/^@/, '') : null;
  const location = [meta.city, meta.state].filter(Boolean).join(', ');
  const priceLabel = price != null
    ? `R$ ${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2).replace('.', ',')}/sessão`
    : null;

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
            {priceLabel && (
              <div className="wk-modal-stat">
                <span className="wk-modal-stat-val">{priceLabel}</span>
                <span className="wk-modal-stat-label">Valor por sessão</span>
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
