export function WalkersSkeleton() {
  return (
    <section className="wk-section">
      <p className="lp-section-label">Comunidade</p>
      <h2 className="lp-section-title">Walkers na plataforma</h2>
      <div className="wk-skeleton-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="wk-skeleton-card">
            <div className="wk-skeleton-img" />
            <div className="wk-skeleton-body">
              <div className="wk-skeleton-line" style={{ width: '60%' }} />
              <div className="wk-skeleton-line" style={{ width: '40%', height: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
