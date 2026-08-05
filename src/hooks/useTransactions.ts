import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionsApi, type Transaction } from "@/lib/client/api";
import { useSession } from "@/lib/client/useSession";

export function useTransactions() {
  const { user } = useSession();
  return useQuery({ queryKey: ["transactions", user?.id], queryFn: () => transactionsApi.list(user!.id), enabled: Boolean(user?.id) });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => transactionsApi.create(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(user!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
