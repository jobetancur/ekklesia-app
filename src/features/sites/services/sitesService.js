import { supabase } from '@/lib/supabase';

export async function getSites(organizationId = null) {
  let query = supabase
    .from('sites')
    .select('id, name, city, address, organization_id')
    .order('name');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
