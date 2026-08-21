import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { formatDate, formatDuration } from '@/lib/utils';

export default async function RelatoriosPage() {
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: reports } = await supabase
    .from('walk_reports')
    .select('id, created_at, duration_minutes, distance_meters, pee_count, poop_count, note_count, photos, notes')
    .eq('walker_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Relatórios de Passeio</h1>

      {!reports?.length && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          Nenhum relatório ainda.
        </div>
      )}

      <div className="space-y-4">
        {reports?.map((r: any) => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-800">{formatDate(r.created_at)}</p>
              <span className="text-xs text-gray-400">{formatDuration(r.duration_minutes)}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
              <span>📍 {(r.distance_meters / 1000).toFixed(1)} km</span>
              {r.pee_count > 0  && <span>💧 {r.pee_count} xixi</span>}
              {r.poop_count > 0 && <span>💩 {r.poop_count} cocô</span>}
              {r.note_count > 0 && <span>📝 {r.note_count} notas</span>}
            </div>
            {r.notes && <p className="mt-3 text-sm text-gray-500 italic">{r.notes}</p>}
            {r.photos?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.photos.map((url: string, i: number) => (
                  <img key={i} src={url} alt="foto do passeio"
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
