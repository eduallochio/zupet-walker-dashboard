import { createClient } from '@supabase/supabase-js';

type ErrorType = 'crash' | 'sync_error' | 'api_error' | 'validation' | 'unknown';

interface ErrorLogParams {
  errorType?: ErrorType;
  errorCode?: string;
  message: string;
  stackTrace?: string;
  screen?: string;
  action?: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function logError(params: ErrorLogParams): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from('app_errors').insert({
      app:         'zupet-walker-web',
      user_id:     params.userId ?? null,
      error_type:  params.errorType ?? 'unknown',
      error_code:  params.errorCode ?? null,
      message:     params.message,
      stack_trace: params.stackTrace ?? null,
      screen:      params.screen ?? null,
      action:      params.action ?? null,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
      platform:    'web',
      metadata:    params.metadata ?? {},
    });
  } catch {
    // silencia — log de erro não pode lançar exceção
  }
}

// Helper para uso em catch blocks de Server Actions / Route Handlers
// Exemplo: await logServerError(err, { screen: '/dashboard/financeiro', action: 'load' })
export async function logServerError(
  err: unknown,
  ctx: { screen?: string; action?: string; userId?: string | null; metadata?: Record<string, unknown> } = {},
): Promise<void> {
  const error = err instanceof Error ? err : new Error(String(err));
  await logError({
    errorType:  'api_error',
    message:    error.message,
    stackTrace: error.stack,
    ...ctx,
  });
}
