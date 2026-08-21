import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=oauth_error', req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error: exchangeError } = await anonClient.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
  }

  // Block access if user has no walker profile
  const { data: profile } = await supabaseAdmin
    .from('walker_profiles')
    .select('id')
    .eq('id', data.session.user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL('/login?error=not_walker', req.url));
  }

  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.set('sb-access-token',  data.session.access_token,  { httpOnly: false, path: '/', maxAge: 60 * 60 * 24 * 7,  sameSite: 'lax' });
  res.cookies.set('sb-refresh-token', data.session.refresh_token, { httpOnly: true,  path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
  return res;
}
