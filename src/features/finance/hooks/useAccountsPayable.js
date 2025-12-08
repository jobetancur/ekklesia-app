import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import {
  listAccountsPayable,
  markAccountAsPaid,
} from '@/features/finance/services/accountsPayableService';

const SEMAPHORE_THRESHOLDS = {
  green: 7,
  yellow: 3,
};

function computeSemaphoreStatus({ due_date: dueDateString, is_paid: isPaid }) {
  if (isPaid) {
    return {
      label: 'Pagado',
      tone: 'success',
      icon: '✅',
      daysUntilDue: null,
      isOverdue: false,
    };
  }

  const dueDate = parseISO(dueDateString);
  const daysDifference = differenceInCalendarDays(dueDate, new Date());

  if (daysDifference > SEMAPHORE_THRESHOLDS.green) {
    return {
      label: '🟢 Más de 7 días',
      tone: 'success',
      icon: '🟢',
      daysUntilDue: daysDifference,
      isOverdue: false,
    };
  }

  if (daysDifference >= SEMAPHORE_THRESHOLDS.yellow) {
    return {
      label: '🟡 Entre 3 y 7 días',
      tone: 'warning',
      icon: '🟡',
      daysUntilDue: daysDifference,
      isOverdue: false,
    };
  }

  if (daysDifference >= 0) {
    return {
      label: '🟠 Menos de 3 días',
      tone: 'warning',
      icon: '🟠',
      daysUntilDue: daysDifference,
      isOverdue: false,
    };
  }

  return {
    label: '🔴 Vencido',
    tone: 'danger',
    icon: '🔴',
    daysUntilDue: daysDifference,
    isOverdue: true,
  };
}

export function useAccountsPayable({ siteId, enabled = true }) {
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['accountsPayable', siteId],
    queryFn: () => listAccountsPayable({ siteId }),
    enabled: Boolean(siteId) && enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const enrichedData = useMemo(() => {
    if (!accountsQuery.data) {
      return [];
    }

    return accountsQuery.data.map((account) => ({
      ...account,
      status: computeSemaphoreStatus(account),
    }));
  }, [accountsQuery.data]);

  const markAsPaid = useMutation({
    mutationFn: (accountId) => markAccountAsPaid(accountId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['accountsPayable', siteId] }),
  });

  return {
    ...accountsQuery,
    data: enrichedData,
    markAsPaid: markAsPaid.mutateAsync,
    isMarkingPaid: markAsPaid.isLoading,
  };
}
