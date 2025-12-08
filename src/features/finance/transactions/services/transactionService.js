import { supabase } from '@/lib/supabase';

export async function listTransactions({ siteId }) {
  if (!siteId) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      financial_accounts (
        id,
        name,
        type
      ),
      account_categories (
        id,
        name,
        type
      )
    `)
    .eq('site_id', siteId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTransaction(transactionData) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        ...transactionData,
        status: 'COMPLETED', // Default status
        metadata: {},
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(id, updates) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
