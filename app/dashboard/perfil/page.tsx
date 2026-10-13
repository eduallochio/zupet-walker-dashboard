import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
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
    .select('name, bio, phone, city, neighborhood, plan, summary_items, service_radius_km, accepted_sizes, accepts_last_minute, username')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="zw-page" style={{ maxWidth: 760 }}>
      <header className="zw-in" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Meu perfil</h1>
        <span style={{ fontSize: 14, color: '#A3BCB0' }}>O que os tutores veem quando encontram você no Zupet</span>
      </header>
      <ProfileForm
        initialName={profile?.name ?? ''}
        initialBio={profile?.bio ?? ''}
        initialPhone={profile?.phone ?? ''}
        initialCity={profile?.city ?? ''}
        initialNeighborhood={(profile as any)?.neighborhood ?? ''}
        plan={profile?.plan ?? 'free'}
        initialSummaryItems={(profile as any)?.summary_items ?? []}
        initialServiceRadiusKm={(profile as any)?.service_radius_km ?? 5}
        initialAcceptedSizes={(profile as any)?.accepted_sizes ?? ['small', 'medium', 'large']}
        initialAcceptsLastMinute={(profile as any)?.accepts_last_minute ?? false}
        initialUsername={(profile as any)?.username ?? ''}
        userId={user.id}
        accessToken={accessToken}
      />
    </div>
  );
}
