import { useQuery } from '@tanstack/react-query';
import { getSites } from '../services/sitesService';

export function useSites(organizationId = null) {
  return useQuery({
    queryKey: ['sites', organizationId],
    queryFn: () => getSites(organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
