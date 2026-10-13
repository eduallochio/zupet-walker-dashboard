import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, MapPin, PawPrint, Plus, Star, Wallet, Inbox } from 'lucide-react';
import { T, Card, CardHeader, Label, Chip, EmptyState, IconBox, Avatar, ButtonLink, corPorNome } from '@/components/walker/dash-ui';
import { MarcarPago, ResolverAtrasado, CopiarLink } from '@/components/walker/PendenciaAcoes';
import { brl, decimal, duracao, km, plural, dataCurta, hora, relativo, saudacao, semanaAtual, diaKey } from '@/lib/format';

const SERVICE_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem',
  daycare: 'Day Care', vet_visit: 'Visita Veterinária', training: 'Adestramento',
};
const SERVICE_COLOR: Record<string, string> = {
  walk: '#22C55E', bath: '#60A5FA', training: '#F472B6', boarding: '#C4B5FD', daycare: '#FDBA74', vet_visit: '#FCA5A5',
};
const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default async function DashboardPage() {
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('walker_profiles')
    .select('id, name, plan, city, username')
    .eq('user_id', user.id)
    .single();
  const walkerId = profile?.id;
  if (!walkerId) return null;

  // ── Janelas de tempo (fuso de Brasília) ──
  const semana = semanaAtual();
  const agoraBR = new Date(Date.now() - 3 * 3600_000);
  const mesInicio = new Date(Date.UTC(agoraBR.getUTCFullYear(), agoraBR.getUTCMonth(), 1) + 3 * 3600_000).toISOString();
  const atrasoLimite = new Date(Date.now() - 3 * 3600_000).toISOString(); // confirmado há mais de 3h e não registrado
  const hojeKey = diaKey(new Date().toISOString());
  const nomeMes = new Date().toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' });

  const [
    { data: semanaSchedules },
    { data: atrasados },
    { count: solicitacoes },
    { data: pagamentosMes },
    { data: pagamentosPendentes },
    { data: ratings },
    { data: links },
    { data: relatorios },
  ] = await Promise.all([
    supabase.from('walk_schedules')
      .select('id, scheduled_at, status, pet_ids, duration_minutes, service_type, owner_id, walker_services(type, label)')
      .eq('walker_id', walkerId)
      .in('status', ['confirmed', 'proposed', 'done'])
      .gte('scheduled_at', semana.inicio)
      .lte('scheduled_at', semana.fim)
      .order('scheduled_at', { ascending: true }),
    supabase.from('walk_schedules')
      .select('id, scheduled_at, pet_ids, service_type, walker_services(type, label)')
      .eq('walker_id', walkerId)
      .eq('status', 'confirmed')
      .lt('scheduled_at', atrasoLimite)
      .order('scheduled_at', { ascending: false })
      .limit(5),
    supabase.from('walk_schedules')
      .select('id', { count: 'exact', head: true })
      .eq('walker_id', walkerId)
      .eq('status', 'proposed'),
    supabase.from('walker_payments')
      .select('amount, status')
      .eq('walker_id', walkerId)
      .gte('created_at', mesInicio),
    supabase.from('walker_payments')
      .select('id, amount, description, service_type, created_at, owner_id')
      .eq('walker_id', walkerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('walker_ratings').select('rating').eq('walker_id', walkerId),
    supabase.from('walker_pet_links').select('pet_id').eq('walker_id', walkerId).eq('status', 'active'),
    supabase.from('walk_reports')
      .select('id, created_at, duration_minutes, distance_meters, pee_count, poop_count, photos, pet_ids')
      .eq('walker_id', walkerId)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  // ── Nomes de pets e tutores ──
  const petIds = new Set<string>();
  (links ?? []).forEach((l: any) => l.pet_id && petIds.add(l.pet_id));
  [...(semanaSchedules ?? []), ...(atrasados ?? []), ...(relatorios ?? [])].forEach((s: any) => (s.pet_ids ?? []).forEach((id: string) => petIds.add(id)));
  const ownerIds = [...new Set((pagamentosPendentes ?? []).map((p: any) => p.owner_id).filter(Boolean))];

  const [{ data: pets }, { data: owners }] = await Promise.all([
    petIds.size ? supabase.from('pets').select('id, name, breed, photo_uri').in('id', [...petIds]) : Promise.resolve({ data: [] as any[] }),
    ownerIds.length ? supabase.from('user_profiles').select('user_id, name').in('user_id', ownerIds) : Promise.resolve({ data: [] as any[] }),
  ]);
  const petById: Record<string, any> = {};
  (pets ?? []).forEach((p: any) => { petById[p.id] = p; });
  const ownerName: Record<string, string> = {};
  (owners ?? []).forEach((o: any) => { ownerName[o.user_id] = o.name; });
  const nomesPets = (ids: string[] | null) => (ids ?? []).map((id) => petById[id]?.name).filter(Boolean).join(' e ') || 'Pet';
  const servico = (s: any) => SERVICE_LABEL[s.walker_services?.type ?? s.service_type] ?? s.walker_services?.label ?? 'Atendimento';

  // ── Semana ──
  const porDia: Record<string, any[]> = {};
  (semanaSchedules ?? []).forEach((s: any) => { (porDia[diaKey(s.scheduled_at)] ??= []).push(s); });
  const hoje = (porDia[hojeKey] ?? []).filter((s: any) => s.status !== 'proposed');

  // ── Dinheiro do mês ──
  const recebido = (pagamentosMes ?? []).filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
  const aReceber = (pagamentosMes ?? []).filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
  const total = recebido + aReceber;

  // ── Reputação ──
  const notas = (ratings ?? []).map((r: any) => Number(r.rating));
  const media = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

  // ── Pets e último passeio ──
  const ultimoPasseio: Record<string, string> = {};
  (relatorios ?? []).forEach((r: any) => (r.pet_ids ?? []).forEach((id: string) => { if (!ultimoPasseio[id]) ultimoPasseio[id] = r.created_at; }));
  const petsAtivos = (links ?? []).map((l: any) => petById[l.pet_id]).filter(Boolean);
  const recentes = (relatorios ?? []).slice(0, 4);

  // ── Pendências ──
  const totalPendencias = (atrasados?.length ?? 0) + (solicitacoes ? 1 : 0) + (pagamentosPendentes?.length ?? 0);

  const firstName = profile?.name?.split(' ')[0] ?? 'Walker';
  const linkPublico = profile?.username ? `https://walker.zupet.io/w/${profile.username}` : null;
  const dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' });

  return (
    <div className="zw-page">
      {/* ── Cabeçalho ── */}
      <header className="zw-in" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 14, color: T.muted, fontWeight: 600, textTransform: 'capitalize' }}>
            {dataHoje}{profile?.city ? ` · ${profile.city}` : ''}
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {saudacao()}, {firstName}{hoje.length ? `. ${plural(hoje.length, 'atendimento', 'atendimentos')} hoje.` : ''}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {linkPublico && <CopiarLink url={linkPublico} />}
          <ButtonLink href="/dashboard/agenda"><Plus size={16} strokeWidth={2.4} aria-hidden />Novo agendamento</ButtonLink>
        </div>
      </header>

      <div className="zw-grid-2 zw-in">
        {/* ── Sua semana ── */}
        <Card pad={false}>
          <CardHeader title="Sua semana" href="/dashboard/agenda" linkLabel="Abrir agenda" />
          <div style={{ display: 'flex', gap: 6, padding: '0 12px 14px' }}>
            {semana.dias.map((d, i) => {
              const n = (porDia[d.key] ?? []).length;
              return (
                <a key={d.key} href="/dashboard/agenda" className={`zw-day${d.hoje ? ' hoje' : ''}`} aria-label={`${DIAS[i]} ${d.dia}: ${plural(n, 'atendimento', 'atendimentos')}`}>
                  <span>{DIAS[i]}</span><b>{d.dia}</b>
                  <span className="zw-dots">{Array.from({ length: Math.min(n, 4) }).map((_, k) => <i key={k} />)}</span>
                </a>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${T.line}` }}>
            {hoje.length ? (
              <>
                <div style={{ padding: '12px 18px 4px' }}><Label>Hoje</Label></div>
                {hoje.map((s: any) => {
                  const tipo = s.walker_services?.type ?? s.service_type;
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px' }}>
                      <div style={{ width: 56, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{hora(s.scheduled_at)}</span>
                        <span style={{ fontSize: 12, color: T.muted }}>{duracao(s.duration_minutes)}</span>
                      </div>
                      <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: SERVICE_COLOR[tipo] ?? T.accent }} />
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{servico(s)} · {nomesPets(s.pet_ids)}</span>
                      </div>
                      {s.status === 'done' ? <Chip tone="neutral">Concluído</Chip> : <Chip>Confirmado</Chip>}
                    </div>
                  );
                })}
              </>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title={(semanaSchedules?.length ?? 0) ? 'Nada para hoje' : 'Nenhum atendimento esta semana'}
                text={linkPublico ? 'Envie seu link para os tutores escolherem um horário, ou crie um agendamento.' : 'Crie um agendamento ou aguarde as solicitações dos tutores pelo app.'}
              />
            )}
          </div>
        </Card>

        {/* ── Pendências ── */}
        <Card pad={false}>
          <CardHeader title={<>Pendências {totalPendencias > 0 && <Chip tone="amber">{totalPendencias}</Chip>}</>} />
          {(atrasados ?? []).map((s: any) => (
            <div key={s.id} className="zw-row" style={{ flexWrap: 'wrap' }}>
              <IconBox icon={AlertTriangle} bg={T.amberDim} fg={T.amber} />
              <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{servico(s)} de {nomesPets(s.pet_ids)} ficou sem registro</span>
                <span style={{ fontSize: 13, color: T.muted }}>{dataCurta(s.scheduled_at)} às {hora(s.scheduled_at)} · ainda marcado como confirmado</span>
              </div>
              <ResolverAtrasado scheduleId={s.id} />
            </div>
          ))}
          {!!solicitacoes && (
            <div className="zw-row">
              <IconBox icon={Inbox} bg={T.amberDim} fg={T.amber} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{plural(solicitacoes, 'solicitação aguardando', 'solicitações aguardando')} resposta</span>
                <span style={{ fontSize: 13, color: T.muted }}>Tutores pediram um horário com você</span>
              </div>
              <ButtonLink href="/dashboard/agenda" variant="ghost" small>Responder</ButtonLink>
            </div>
          )}
          {(pagamentosPendentes ?? []).map((p: any) => (
            <div key={p.id} className="zw-row">
              <IconBox icon={Wallet} bg={T.amberDim} fg={T.amber} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Receber {brl(Number(p.amount))}{ownerName[p.owner_id] ? ` de ${ownerName[p.owner_id]}` : ''}</span>
                <span style={{ fontSize: 13, color: T.muted }}>{SERVICE_LABEL[p.service_type] ?? p.description ?? 'Serviço'} · {dataCurta(p.created_at)}</span>
              </div>
              <MarcarPago paymentId={p.id} />
            </div>
          ))}
          {totalPendencias === 0 && (
            <div className="zw-row" style={{ color: T.accentLt, fontWeight: 700, fontSize: 14 }}>
              <CheckCircle2 size={18} aria-hidden /> Tudo em dia. Bom trabalho!
            </div>
          )}
        </Card>
      </div>

      <div className="zw-grid-3 zw-in">
        {/* ── Dinheiro do mês ── */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>Dinheiro de {nomeMes}</h2>
            <a href="/dashboard/financeiro" style={{ fontSize: 13, fontWeight: 700, color: T.accentLt, textDecoration: 'none' }}>Financeiro</a>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><Label>Recebido</Label><span style={{ fontSize: 26, fontWeight: 800, color: T.accentLt }}>{brl(recebido)}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><Label>A receber</Label><span style={{ fontSize: 26, fontWeight: 800, color: T.amber }}>{brl(aReceber)}</span></div>
          </div>
          <div role="img" aria-label={`Recebido ${brl(recebido)}, a receber ${brl(aReceber)}`} style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
            <span style={{ width: `${total ? (recebido / total) * 100 : 0}%`, background: T.accent }} />
            <span style={{ width: `${total ? (aReceber / total) * 100 : 0}%`, background: T.amber }} />
          </div>
          <span style={{ fontSize: 13, color: T.muted }}>
            {aReceber > 0 ? 'Marque os pagamentos que já caíram para manter o caixa certo.' : total > 0 ? 'Nada pendente neste mês.' : 'Nenhum lançamento neste mês ainda.'}
          </span>
        </Card>

        {/* ── Pets ── */}
        <Card pad={false}>
          <CardHeader title="Pets" extra={<span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>{plural(petsAtivos.length, 'ativo', 'ativos')}</span>} />
          {petsAtivos.length ? petsAtivos.slice(0, 5).map((p: any) => (
            <div key={p.id} className="zw-row" style={{ padding: '10px 18px' }}>
              <Avatar name={p.name} src={p.photo_uri} bg={corPorNome(p.name)} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: T.muted }}>
                  {p.breed ? `${p.breed} · ` : ''}{ultimoPasseio[p.id] ? `último passeio ${relativo(ultimoPasseio[p.id])}` : 'sem passeios registrados'}
                </span>
              </div>
            </div>
          )) : (
            <EmptyState icon={PawPrint} title="Nenhum pet vinculado" text="Os tutores vinculam os pets a você pelo app Zupet." />
          )}
        </Card>

        {/* ── Reputação ── */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Sua reputação</h2>
          {media !== null ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>{decimal(media)}</span>
                <span style={{ fontSize: 14, color: T.muted, fontWeight: 600 }}>de 5 · {plural(notas.length, 'avaliação', 'avaliações')}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, color: T.amber }} aria-hidden>
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={18} fill={i <= Math.round(media) ? 'currentColor' : 'none'} />)}
              </div>
            </>
          ) : (
            <span style={{ fontSize: 14, color: T.muted }}>Sem avaliações ainda. Elas aparecem depois dos primeiros atendimentos.</span>
          )}
          {profile?.plan !== 'pro' && (
            <span style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>Profissionais Pro aparecem em destaque na busca dos tutores.</span>
          )}
        </Card>
      </div>

      {/* ── Passeios recentes ── */}
      <Card pad={false} style={{ marginBottom: 8 }}>
        <CardHeader title="Passeios recentes" href="/dashboard/relatorios" linkLabel="Ver relatórios" />
        {recentes.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, padding: '0 18px 18px' }}>
            {recentes.map((r: any) => {
              const dist = km(r.distance_meters);
              const eventos = [r.pee_count ? `Xixi ${r.pee_count}` : null, r.poop_count ? `Cocô ${r.poop_count}` : null, r.photos?.length ? plural(r.photos.length, 'foto', 'fotos') : null].filter(Boolean).join(' · ');
              return (
                <a key={r.id} href={`/dashboard/relatorios/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', border: `1px solid ${T.line}`, borderRadius: 14, padding: '12px 14px', background: T.card2, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{nomesPets(r.pet_ids)} · {relativo(r.created_at)}</span>
                  <span style={{ fontSize: 13, color: T.muted, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={14} aria-hidden />{duracao(r.duration_minutes)}</span>
                    {dist && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={14} aria-hidden />{dist}</span>}
                  </span>
                  {eventos && <span style={{ fontSize: 12, color: T.muted }}>{eventos}</span>}
                  {!dist && <span><Chip tone="amber">Rota não registrada</Chip></span>}
                </a>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={MapPin} title="Nenhum passeio registrado ainda" text="Os relatórios aparecem aqui quando você finaliza um passeio no app." />
        )}
      </Card>
    </div>
  );
}
