import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '64px 80px',
          background: 'linear-gradient(135deg, #0a0f0d 0%, #14271e 60%, #0a0f0d 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* accent glow */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          {/* app icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #2dd47a 0%, #1db868 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {/* paw prints in white */}
            <svg width="34" height="34" viewBox="0 0 100 100" fill="white">
              {/* left paw - toes */}
              <ellipse cx="20" cy="28" rx="7" ry="9" />
              <ellipse cx="31" cy="21" rx="7" ry="9" />
              <ellipse cx="43" cy="20" rx="7" ry="9" />
              <ellipse cx="54" cy="26" rx="7" ry="9" />
              {/* left paw - pad */}
              <ellipse cx="37" cy="48" rx="17" ry="19" />
              {/* right paw - toes */}
              <ellipse cx="52" cy="68" rx="5.5" ry="7" />
              <ellipse cx="61" cy="63" rx="5.5" ry="7" />
              <ellipse cx="71" cy="62" rx="5.5" ry="7" />
              <ellipse cx="80" cy="67" rx="5.5" ry="7" />
              {/* right paw - pad */}
              <ellipse cx="66" cy="82" rx="13" ry="14" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f0faf3', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Zupet
            </span>
            <span style={{ color: '#4ade80', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Walker
            </span>
          </div>
        </div>

        {/* headline */}
        <div style={{ fontSize: 72, fontWeight: 800, color: '#ffffff', lineHeight: 1.0, letterSpacing: '-0.04em', marginBottom: 20, display: 'flex', flexDirection: 'column' }}>
          <span>Transforme seu</span>
          <span>amor por pets em</span>
          <span style={{ color: '#86efac' }}>profissão.</span>
        </div>

        {/* sub */}
        <p style={{ fontSize: 26, color: 'rgba(240,250,243,0.6)', margin: 0, lineHeight: 1.5 }}>
          Registro de rota, relatórios com fotos e controle financeiro.
        </p>

        {/* url */}
        <div style={{ position: 'absolute', bottom: 40, right: 80, fontSize: 18, color: 'rgba(240,250,243,0.35)', display: 'flex' }}>
          walker.zupet.io
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
