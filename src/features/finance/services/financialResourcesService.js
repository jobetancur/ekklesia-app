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

export async function getMinisterialSummary(organizationId, siteId = null, dateRange) {
  let query = supabase
    .from('transactions')
    .select(`
      amount,
      type,
      date,
      site_id,
      account_categories (name, type)
    `)
    .eq('organization_id', organizationId);

  if (siteId) {
    query = query.eq('site_id', siteId);
  }

  if (dateRange?.from) {
    query = query.gte('date', dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    query = query.lte('date', dateRange.to.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  // Calculate totals and trends (placeholder logic for trends)
  const income = data
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  
  const expenses = data
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  // We also need site-specific data for the site list if needed, 
  // but for the KPI cards this is enough.
  // Actually, we need the balance from accounts for more accuracy on "Saldo Total"
  
  const { data: accounts, error: accountsError } = await supabase
    .from('financial_accounts')
    .select('balance')
    .eq('organization_id', organizationId)
    .match(siteId ? { site_id: siteId } : {});

  if (accountsError) throw accountsError;

  const totalBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);

  return {
    income,
    expenses,
    balance: totalBalance,
    transactions: data // Useful for breakdown if needed
  };
}
