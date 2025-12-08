import { supabase } from '@/lib/supabase';

const BASE_FIELDS = 'id, title, amount, due_date, description, is_paid, paid_at, created_at';

export async function listAccountsPayable({ siteId, includePaid = false }) {
  if (!siteId) {
    return [];
  }

  let query = supabase
    .from('accounts_payable')
    .select(BASE_FIELDS)
    .eq('site_id', siteId)
    .order('due_date', { ascending: true });

  if (!includePaid) {
    query = query.eq('is_paid', false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function markAccountAsPaid(accountId) {
  const { data, error } = await supabase
    .from('accounts_payable')
    .update({ is_paid: true, paid_at: new Date().toISOString() })
    .eq('id', accountId)
    .select(BASE_FIELDS)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
