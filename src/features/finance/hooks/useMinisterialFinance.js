import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMinisterialSummary } from '../services/financialResourcesService';

export function useMinisterialFinance(organizationId, initialSiteId = null) {
  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['ministerialFinance', organizationId, selectedSiteId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => getMinisterialSummary(organizationId, selectedSiteId, dateRange),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const stats = useMemo(() => {
    if (!data) return { income: 0, expenses: 0, balance: 0 };
    return {
      income: data.income,
      expenses: data.expenses,
      balance: data.balance
    };
  }, [data]);

  return {
    stats,
    isLoading,
    error,
    selectedSiteId,
    setSelectedSiteId,
    dateRange,
    setDateRange
  };
}
