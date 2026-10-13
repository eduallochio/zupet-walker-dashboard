// Formatadores pt-BR usados no dashboard do walker.
// Regra: números sempre com vírgula decimal e unidades por extenso curtas.

export function brl(value: number | null | undefined) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function decimal(value: number, digits = 1) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** 2400 → "2,4 km" · 0/null → null (sem rota registrada) */
export function km(meters: number | null | undefined) {
  if (!meters || meters <= 0) return null;
  return `${decimal(meters / 1000)} km`;
}

/** 1 → "1 min" · 65 → "1h05" · 120 → "2h" */
export function duracao(minutes: number | null | undefined) {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}

const TZ = 'America/Sao_Paulo';

export function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: TZ }).replace('.', '');
}

export function hora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
}

export function diaSemanaCurto(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', timeZone: TZ }).replace('.', '');
}

export function relativo(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return dataCurta(iso);
}

/** Saudação pelo horário de Brasília (o servidor roda em UTC). */
export function saudacao() {
  const h = Number(new Date().toLocaleString('pt-BR', { hour: '2-digit', hour12: false, timeZone: TZ }));
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Início (segunda 00:00) e fim (domingo 23:59) da semana atual no fuso de Brasília, em ISO UTC. */
export function semanaAtual() {
  const OFFSET = 3 * 3600_000; // UTC-3
  const agoraBR = new Date(Date.now() - OFFSET);
  const dow = (agoraBR.getUTCDay() + 6) % 7; // 0 = segunda
  const inicioBR = Date.UTC(agoraBR.getUTCFullYear(), agoraBR.getUTCMonth(), agoraBR.getUTCDate() - dow);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioBR + i * 86400_000);
    return {
      key: d.toISOString().slice(0, 10),
      dia: d.getUTCDate(),
      hoje: i === dow,
    };
  });
  return {
    inicio: new Date(inicioBR + OFFSET).toISOString(),
    fim: new Date(inicioBR + 7 * 86400_000 + OFFSET - 1).toISOString(),
    dias,
  };
}

/** Chave yyyy-mm-dd de um ISO no fuso de Brasília. */
export function diaKey(iso: string) {
  return new Date(new Date(iso).getTime() - 3 * 3600_000).toISOString().slice(0, 10);
}
