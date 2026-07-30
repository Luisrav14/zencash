import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetsApi, type Budget } from "@/lib/client/api";

export function useBudgets() {
  return useQuery({ queryKey: ["budgets"], queryFn: budgetsApi.list });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Budget>) => budgetsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
