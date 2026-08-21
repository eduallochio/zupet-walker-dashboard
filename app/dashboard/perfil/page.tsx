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
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Meu Perfil</h1>
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
