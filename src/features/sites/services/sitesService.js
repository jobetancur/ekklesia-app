import { supabase } from '@/lib/supabase';

export async function getSites() {
  const { data, error } = await supabase
    .from('sites')
    .select('id, name, city, address') // Adjust fields based on DB schema, safely assuming name is there
    .order('name');

  if (error) {
    throw error;
  }

  return data;
}
