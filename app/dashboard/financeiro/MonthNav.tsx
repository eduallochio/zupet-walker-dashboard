'use client';

import { useRouter } from 'next/navigation';

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function MonthNav({ viewMonth, viewYear, basePath = '/dashboard/financeiro' }: { viewMonth: number; viewYear: number; basePath?: string }) {
  const router = useRouter();
  const now = new Date();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // URL usa mês 1-based (1=Jan … 12=Dez) para ser legível
  function navigate(month: number, year: number) {
    router.push(`${basePath}?mes=${month + 1}&ano=${year}`);
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
      display: 'flex', alignItems: 'center',
      borderRadius: 10, border: '1px solid rgba(134,239,172,0.12)', overflow: 'hidden',
    }}>
      <button onClick={prev} style={btn} aria-label="Mês anterior">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <span style={{ minWidth: 130, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#EEF6F1' }}>
        {MONTHS_PT[viewMonth]} {viewYear}
      </span>
      <button onClick={next} disabled={isCurrentMonth} style={{ ...btn, opacity: isCurrentMonth ? 0.3 : 1 }} aria-label="Próximo mês">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}

const btn: React.CSSProperties = {
  width: 40, height: 40, border: 'none',
  background: 'transparent', cursor: 'pointer', fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#EEF6F1', fontWeight: 700, lineHeight: 1,
};
