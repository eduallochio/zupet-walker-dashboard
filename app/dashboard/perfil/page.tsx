import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import ProfileForm from './ProfileForm';

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
    .select('name, bio, phone, city, plan')
    .eq('user_id', user.id)
    .single();

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em', marginBottom: 28 }}>Meu Perfil</h1>
      <ProfileForm
        initialName={profile?.name ?? ''}
        initialBio={profile?.bio ?? ''}
        initialPhone={profile?.phone ?? ''}
        initialCity={profile?.city ?? ''}
        plan={profile?.plan ?? 'free'}
        userId={user.id}
        accessToken={accessToken}
      />
    </div>
  );
}
