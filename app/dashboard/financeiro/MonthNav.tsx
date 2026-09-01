'use client';

import { useRouter } from 'next/navigation';

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export function MonthNav({ viewMonth, viewYear }: { viewMonth: number; viewYear: number }) {
  const router = useRouter();
  const now = new Date();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // URL usa mês 1-based (1=Jan … 12=Dez) para ser legível
  function navigate(month: number, year: number) {
    router.push(`/dashboard/financeiro?mes=${month + 1}&ano=${year}`);
  }

  function prev() {
    if (viewMonth === 0) navigate(11, viewYear - 1);
    else navigate(viewMonth - 1, viewYear);
  }

  function next() {
    if (isCurrentMonth) return;
    if (viewMonth === 11) navigate(0, viewYear + 1);
    else navigate(viewMonth + 1, viewYear);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'rgba(0,198,167,0.08)', borderRadius: 10,
      padding: '4px 6px', border: '1px solid rgba(0,200,167,0.2)',
    }}>
      <button onClick={prev} style={btn}>‹</button>
      <span style={{ minWidth: 110, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#E8F5F0' }}>
        {MONTHS_PT[viewMonth]} {viewYear}
      </span>
      <button onClick={next} disabled={isCurrentMonth} style={{ ...btn, opacity: isCurrentMonth ? 0.3 : 1 }}>›</button>
    </div>
  );
}

const btn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: 'none',
  background: 'transparent', cursor: 'pointer', fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#E8F5F0', fontWeight: 700, lineHeight: 1,
};
