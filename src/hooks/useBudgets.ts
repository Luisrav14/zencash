import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetsApi, type Budget } from "@/lib/client/api";
import { useSession } from "@/lib/client/useSession";

export function useBudgets() {
  const { user } = useSession();
  return useQuery({ queryKey: ["budgets", user?.id], queryFn: () => budgetsApi.list(user!.id), enabled: Boolean(user?.id) });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (data: Partial<Budget>) => budgetsApi.create(user!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.remove(user!.id, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
