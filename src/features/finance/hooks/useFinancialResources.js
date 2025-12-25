import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFinancialAccounts, 
  getCategories, 
  createFinancialAccount, 
  updateFinancialAccount, 
  createCategory,
  updateCategory,
  deleteFinancialAccount,
  deleteCategory,
  checkEntityUsage
} from '../services/financialResourcesService';

export { checkEntityUsage };

export function useFinancialAccounts(siteId) {
  return useQuery({
    queryKey: ['financialAccounts', siteId],
    queryFn: () => getFinancialAccounts(siteId),
    enabled: Boolean(siteId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCategories(type, siteId) {
  return useQuery({
    queryKey: ['categories', type, siteId],
    queryFn: () => getCategories(type, siteId),
    enabled: true, // Always enabled, even if siteId is missing (will return system defaults)
    staleTime: 1000 * 60 * 60, // 1 hour (categories rarely change)
  });
}

export function useFinancialResourceMutations(siteId, organizationId) {
  const queryClient = useQueryClient();

  // Accounts
  const createAccountMutation = useMutation({
    mutationFn: (data) => createFinancialAccount({ ...data, site_id: siteId, organization_id: organizationId }),
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
    mutationFn: (data) => createCategory({ ...data, site_id: siteId, organization_id: organizationId }), // Categories might be site-specific? Assuming yes based on requirement.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] }); 
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id) => deleteFinancialAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialAccounts', siteId] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    createAccount: createAccountMutation.mutateAsync,
    isCreatingAccount: createAccountMutation.isPending,
    updateAccount: updateAccountMutation.mutateAsync,
    isUpdatingAccount: updateAccountMutation.isPending,
    createCategory: createCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,
    updateCategory: updateCategoryMutation.mutateAsync,
    isUpdatingCategory: updateCategoryMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isDeletingCategory: deleteCategoryMutation.isPending,
    checkEntityUsage,
  };
}
