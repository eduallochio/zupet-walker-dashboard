'use server';

import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function salvarLead(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const instagram = (formData.get('instagram') as string)?.trim() || null;

  if (!name || !phone) {
    return { error: 'Nome e telefone são obrigatórios.' };
  }

  const { error } = await createAdminClient()
    .from('walker_leads')
    .insert({ name, phone, instagram });

  if (error) {
    return { error: 'Erro ao salvar. Tente novamente.' };
  }

  return { success: true };
}
