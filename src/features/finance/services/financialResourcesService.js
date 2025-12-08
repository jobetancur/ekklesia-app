import { supabase } from '@/lib/supabase';

export async function getFinancialAccounts(siteId) {
  const { data, error } = await supabase
    .from('financial_accounts')
    .select('id, name, type, balance, currency')
    .eq('site_id', siteId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
}

export async function getCategories(type) {
  let query = supabase
    .from('account_categories')
    .select('id, name, type, is_system_default')
    .order('name');

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function createFinancialAccount(accountData) {
  const { data, error } = await supabase
    .from('financial_accounts')
    .insert([{ ...accountData, is_active: true }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFinancialAccount(id, updates) {
  const { data, error } = await supabase
    .from('financial_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createCategory(categoryData) {
  const { data, error } = await supabase
    .from('account_categories')
    .insert([{ ...categoryData, is_system_default: false }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
