import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const ua = req.headers.get('user-agent') ?? '';
  const device = getDevice(ua);
  const country = req.headers.get('x-vercel-ip-country') ?? null;

  await supabase.from('page_views').insert({ page: '/', device, country });
  return NextResponse.json({ ok: true });
}
