import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFinancialAccounts, 
  getCategories, 
  createFinancialAccount, 
  updateFinancialAccount, 
  createCategory 
} from '../services/financialResourcesService';

export function useFinancialAccounts(siteId) {
  return useQuery({
    queryKey: ['financialAccounts', siteId],
    queryFn: () => getFinancialAccounts(siteId),
    enabled: Boolean(siteId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCategories(type) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => getCategories(type),
    staleTime: 1000 * 60 * 60, // 1 hour (categories rarely change)
  });
}

export function useFinancialResourceMutations(siteId) {
  const queryClient = useQueryClient();

  // Accounts
  const createAccountMutation = useMutation({
    mutationFn: (data) => createFinancialAccount({ ...data, site_id: siteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialAccounts', siteId] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateFinancialAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialAccounts', siteId] });
    },
  });

  // Categories
  // Note: Categories might be shared specific query invalidation might depend on type
  // For now we invalidate all categories query or specific type if passed
  const createCategoryMutation = useMutation({
    mutationFn: (data) => createCategory({ ...data, site_id: siteId }), // Categories might be site-specific? Assuming yes based on requirement.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // If we had site-specific categories logic in getCategories, we should invalidate that too. 
      // Current getCategories implementation fetches all or by type, does not filter by site yet?
      // Wait, let's double check getCategories implementation.
    },
  });

  return {
    createAccount: createAccountMutation.mutateAsync,
    isCreatingAccount: createAccountMutation.isPending,
    updateAccount: updateAccountMutation.mutateAsync,
    isUpdatingAccount: updateAccountMutation.isPending,
    createCategory: createCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,
  };
}
