import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccountPayable } from '../services/accountsPayableService';

export function useCreatePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPayable) => createAccountPayable(newPayable),
    onSuccess: (data, variables) => {
      // Invalidate the list for the specific site
      queryClient.invalidateQueries({ queryKey: ['accountsPayable', variables.site_id] });
    },
  });
}
