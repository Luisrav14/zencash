import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountsApi, type Account } from "@/lib/client/api";

export function useAccounts() {
  return useQuery({ queryKey: ["accounts"], queryFn: accountsApi.list });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Account>) => accountsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
