import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// --- Queries ---

export const useTitheBatches = (siteId) => {
  return useQuery({
    queryKey: ['tithe-batches', siteId],
    queryFn: async () => {
      let query = supabase
        .from('tithe_batches')
        .select('*')
        .order('batch_date', { ascending: false });
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!siteId
  });
};

export const useTitheBatch = (batchId) => {
  return useQuery({
    queryKey: ['tithe-batch', batchId],
    queryFn: async () => {
      // Fetch batch details and entries
      const { data: batch, error: batchError } = await supabase
        .from('tithe_batches')
        .select(`
            *,
            creator:created_by (
                first_name,
                last_name
            )
        `)
        .eq('id', batchId)
        .single();

      if (batchError) throw batchError;

      const { data: entries, error: entriesError } = await supabase
        .from('tithe_entries')
        .select(`
          *,
          contributors (
            id,
            first_name,
            last_name,
            document_id
          )
        `)
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });

      if (entriesError) throw entriesError;

      return { ...batch, entries };
    },
    enabled: !!batchId,
  });
};

export const useContributors = (search, organizationId) => {
  return useQuery({
    queryKey: ['contributors', search, organizationId],
    queryFn: async () => {
      let query = supabase
        .from('contributors')
        .select('*')
        .eq('organization_id', organizationId)
        .limit(20);

      if (search) {
        const cleanSearch = search.trim();
        const isNumeric = /^\d+$/.test(cleanSearch);

        if (isNumeric) {
            query = query.or(`document_id.ilike.%${cleanSearch}%`);
        } else {
            // Use full_name for better matching (e.g. "Juan Perez")
            query = query.or(`full_name.ilike.%${cleanSearch}%,document_id.ilike.%${cleanSearch}%`); 
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
};

export const useFinancialAccounts = () => {
  return useQuery({
    queryKey: ['financial-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('id, name, type'); 
      
      if (error) throw error;
      return data;
    }
  });
}

// --- Mutations ---

export const useTitheMutations = () => {
  const queryClient = useQueryClient();

  const createBatch = useMutation({
    mutationFn: async (newBatch) => {
      const { data, error } = await supabase
        .from('tithe_batches')
        .insert(newBatch)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.site_id) {
         queryClient.invalidateQueries({ queryKey: ['tithe-batches', variables.site_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['tithe-batches'] });
    },
  });

  const updateBatch = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('tithe_batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tithe-batches'] });
      queryClient.invalidateQueries({ queryKey: ['tithe-batch', data.id] });
    },
  });

  // Helper to recalculate total
  const recalculateBatchTotal = async (batchId) => {
      const { data, error } = await supabase
        .from('tithe_entries')
        .select('amount')
        .eq('batch_id', batchId);
      
      if (error) throw error;
      
      const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      await supabase
        .from('tithe_batches')
        .update({ total_amount: total })
        .eq('id', batchId);
  };

  const addTitheEntry = useMutation({
    mutationFn: async (entry) => {
      const { data, error } = await supabase
        .from('tithe_entries')
        .insert(entry)
        .select(`
            *,
            contributors(id, first_name, last_name, document_id)
        `)
        .single();
      
      if (error) throw error;
      
      // Update total
      await recalculateBatchTotal(entry.batch_id);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tithe-batch', variables.batch_id] });
       queryClient.invalidateQueries({ queryKey: ['tithe-batches'] });
    },
  });

  const deleteTitheEntry = useMutation({
    mutationFn: async ({ entryId, batchId }) => {
       const { error } = await supabase
         .from('tithe_entries')
         .delete()
         .eq('id', entryId);

       if (error) throw error;
       
       // Update total
       if (batchId) {
           await recalculateBatchTotal(batchId);
       }
       
       return entryId;
    },
    onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ['tithe-batches'] });
       if (variables.batchId) {
          queryClient.invalidateQueries({ queryKey: ['tithe-batch', variables.batchId] });
       }
    }
  });

  const createContributor = useMutation({
    mutationFn: async ({ first_name, last_name, document_id, email, phone, organization_id, site_id }) => {
      const { data, error } = await supabase
        .from('contributors')
        .insert({
            first_name, 
            last_name, 
            document_id, 
            email, 
            phone,
            organization_id, 
            site_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
       const orgId = variables.organization_id; 
       queryClient.invalidateQueries({ queryKey: ['contributors', undefined, orgId] }); 
       queryClient.invalidateQueries({ queryKey: ['contributors'] });
    },
  });

  const approveBatch = useMutation({
    mutationFn: async ({ batch_id, target_account_id, category_id }) => {
      const { data, error } = await supabase
        .rpc('approve_tithe_batch', { 
           batch_id, 
           target_account_id,
           category_id
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tithe-batches'] });
      queryClient.invalidateQueries({ queryKey: ['tithe-batch', variables.batch_id] });
    },
  });

  return {
    createBatch,
    updateBatch,
    addTitheEntry,
    deleteTitheEntry,
    createContributor,
    approveBatch,
  };
};
