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

export async function getCategories(type, siteId) {
  let query = supabase
    .from('account_categories')
    .select('id, name, type, is_system_default, site_id')
    .order('name');

  if (type) {
    query = query.eq('type', type);
  }

  if (siteId) {
    // Show system defaults OR items belonging to this site
    query = query.or(`is_system_default.eq.true,site_id.eq.${siteId}`);
  } else {
    // If no siteId, maybe just show system defaults? Or all?
    // Safe default: just system defaults to avoid leaking other sites data if RLS fails
    query = query.eq('is_system_default', true);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function createFinancialAccount(accountData) {
  const { data, error } = await supabase
    .from('financial_accounts')
    .insert([{ 
      ...accountData, 
      is_active: true,
      balance: 0,
      currency: 'COP'  // Default currency
    }])
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

export async function updateCategory(id, updates) {
  const { data, error } = await supabase
    .from('account_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFinancialAccount(id) {
  const { error } = await supabase
    .from('financial_accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from('account_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function checkEntityUsage(entityType, id) {
  const column = entityType === 'account' ? 'account_id' : 'category_id';
  
  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq(column, id);

  if (error) throw error;
  return count;
}
