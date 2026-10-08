import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Footprints, Droplet, Moon, Home, Stethoscope, Target, PawPrint, Smartphone, Clock, Users, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { T, Card, Chip, EmptyState, Label, IconBox, Avatar } from '@/components/walker/dash-ui';
import { brl, decimal, duracao, plural } from '@/lib/format';

const TYPE_ICON: Record<string, { icon: LucideIcon; fg: string; bg: string }> = {
  walk:     { icon: Footprints,  fg: '#86EFAC', bg: 'rgba(34,197,94,0.12)' },
  bath:     { icon: Droplet,     fg: '#93C5FD', bg: 'rgba(96,165,250,0.12)' },
  hotel:    { icon: Moon,        fg: '#C4B5FD', bg: 'rgba(196,181,253,0.12)' },
  boarding: { icon: Moon,        fg: '#C4B5FD', bg: 'rgba(196,181,253,0.12)' },
  day_care: { icon: Home,        fg: '#FDBA74', bg: 'rgba(253,186,116,0.12)' },
  daycare:  { icon: Home,        fg: '#FDBA74', bg: 'rgba(253,186,116,0.12)' },
  vet:      { icon: Stethoscope, fg: '#FCA5A5', bg: 'rgba(252,165,165,0.12)' },
  vet_visit:{ icon: Stethoscope, fg: '#FCA5A5', bg: 'rgba(252,165,165,0.12)' },
  training: { icon: Target,      fg: '#F9A8D4', bg: 'rgba(244,114,182,0.12)' },
};

// Só mostra pacotes com preço definido (antes apareciam vários "R$ 0,00")
function pacotes(svc: any) {
  return ([
    ['Diário', svc.price_daily],
    ['Semanal', svc.price_weekly],
    ['Quinzenal', svc.price_biweekly],
    ['Mensal', svc.price_monthly],
  ] as [string, number | null][]).filter(([, v]) => v != null && Number(v) > 0);
}

export default async function ServicosPage() {
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
    .from('walker_profiles').select('id, plan, name, city, avatar_url').eq('user_id', user.id).single();
  const isPro = profile?.plan === 'pro';

  const [{ data: services }, { data: ratings }] = await Promise.all([
    profile?.id ? supabase
      .from('walker_services')
      .select('id, type, label, description, price, price_daily, price_weekly, price_biweekly, price_monthly, duration_minutes, max_pets, active, sort_order')
      .eq('walker_id', profile.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }) : Promise.resolve({ data: [] as any[] }),
    profile?.id ? supabase.from('walker_ratings').select('rating').eq('walker_id', profile.id) : Promise.resolve({ data: [] as any[] }),
  ]);

  const rows = (services ?? []) as any[];
  const active = rows.filter((s: any) => s.active);
  const inactive = rows.filter((s: any) => !s.active);
  const notas = (ratings ?? []).map((r: any) => Number(r.rating));
  const media = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

  return (
    <div className="zw-page">
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Serviços</h1>
          <span style={{ fontSize: 14, color: T.muted }}>{plural(active.length, 'serviço ativo', 'serviços ativos')} no seu perfil</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.muted }}>
          <Smartphone size={16} aria-hidden /> Preços e pacotes são editados no app
        </span>
      </header>

      {!isPro && rows.length >= 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(251,191,36,0.08)', border: `1px solid ${T.amberLine}` }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>O plano grátis permite 1 serviço</span>
            <span style={{ fontSize: 13, color: T.muted }}>Para oferecer mais tipos de atendimento aos tutores, assine o Pro.</span>
          </div>
          <a href="/dashboard/pro" className="zw-btn zw-btn-primary zw-btn-s">Conhecer o Pro</a>
        </div>
      )}

      {rows.length === 0 ? (
        <Card><EmptyState icon={PawPrint} title="Nenhum serviço cadastrado" text="Adicione serviços no app para que os tutores possam te contratar." /></Card>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...active, ...inactive].map((svc: any) => <ServiceCard key={svc.id} svc={svc} />)}
          </div>

          {/* Prévia de como o tutor vê */}
          <aside style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Label>Como o tutor vê</Label>
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#132219' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar name={profile?.name ?? 'Walker'} src={profile?.avatar_url} size={48} bg={T.accentLt} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{profile?.name ?? 'Seu nome'}</span>
                  <span style={{ fontSize: 12, color: T.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {profile?.city ?? 'Sua cidade'}
                    {media !== null && <> · <Star size={12} fill="currentColor" color={T.amber} aria-hidden /> {decimal(media)} ({notas.length})</>}
                  </span>
                </div>
              </div>
              {active.length ? active.map((s: any) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.14)', fontSize: 14 }}>
                  <span>{s.label}</span><b>{s.price != null && Number(s.price) > 0 ? brl(Number(s.price)) : 'A combinar'}</b>
                </div>
              )) : <span style={{ fontSize: 13, color: T.amber }}>Nenhum serviço ativo. Os tutores não conseguem agendar.</span>}
            </Card>
            <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Prévia do card que aparece na busca do app Zupet.</span>
          </aside>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ svc }: { svc: any }) {
  const meta = TYPE_ICON[svc.type] ?? { icon: PawPrint, fg: T.accentLt, bg: T.accentDim };
  const pk = pacotes(svc);
  const temPreco = svc.price != null && Number(svc.price) > 0;
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, opacity: svc.active ? 1 : 0.7 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <IconBox icon={meta.icon} fg={meta.fg} bg={meta.bg} size={48} />
        <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {svc.label}
            {svc.active ? <Chip>Ativo</Chip> : <Chip tone="neutral">Inativo</Chip>}
          </span>
          {svc.description
            ? <span style={{ fontSize: 14, color: T.muted }}>{svc.description}</span>
            : <span style={{ fontSize: 13, color: T.amber }}>Sem descrição. Adicione no app para os tutores saberem o que está incluso.</span>}
          <span style={{ fontSize: 13, color: T.muted, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {svc.duration_minutes && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={14} aria-hidden />{duracao(svc.duration_minutes)}</span>}
            {svc.max_pets && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={14} aria-hidden />até {plural(svc.max_pets, 'pet', 'pets')}</span>}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{temPreco ? brl(Number(svc.price)) : 'A combinar'}</span>
          {temPreco && <span style={{ fontSize: 12, color: T.muted }}>por sessão</span>}
        </div>
      </div>
      {pk.length > 0 ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {pk.map(([nome, v]) => (
            <div key={nome} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', borderRadius: 12, background: T.card2, border: `1px solid ${T.line}`, minWidth: 110 }}>
              <Label>{nome}</Label>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{brl(Number(v))}</span>
            </div>
          ))}
        </div>
      ) : (
        <span style={{ fontSize: 13, color: T.muted }}>Sem pacotes. Criar pacotes no app ajuda a fidelizar tutores.</span>
      )}
    </Card>
  );
}
