import { useQuery } from '@tanstack/react-query';
import { getSites } from '../services/sitesService';

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: getSites,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
