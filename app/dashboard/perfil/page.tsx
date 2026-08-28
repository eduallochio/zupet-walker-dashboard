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
    .select('name, bio, phone, city, neighborhood, plan, summary_items, service_radius_km, accepted_sizes, accepts_last_minute')
    .eq('user_id', user.id)
    .single();

  return (
    <div style={{ maxWidth: 560, padding: '28px 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#E8F5F0', letterSpacing: '-0.03em', marginBottom: 28 }}>Meu Perfil</h1>
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
        userId={user.id}
        accessToken={accessToken}
      />
    </div>
  );
}
