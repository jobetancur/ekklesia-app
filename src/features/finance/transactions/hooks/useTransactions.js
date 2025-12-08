import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listTransactions, createTransaction, updateTransaction } from '../services/transactionService';

export function useTransactions({ siteId, enabled = true }) {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', siteId],
    queryFn: () => listTransactions({ siteId }),
    enabled: Boolean(siteId) && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: (newTransaction) => createTransaction(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', siteId] });
      // Also invalidate account balances if we were tracking them automatically (which we might be in the future)
      queryClient.invalidateQueries({ queryKey: ['financialAccounts', siteId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }) => updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', siteId] });
      queryClient.invalidateQueries({ queryKey: ['financialAccounts', siteId] });
    },
  });

  return {
    ...transactionsQuery,
    createTransaction: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTransaction: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
