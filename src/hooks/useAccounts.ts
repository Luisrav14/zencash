import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountsApi, type Account } from "@/lib/client/api";
import { useSession } from "@/lib/client/useSession";

export function useAccounts() {
  const { user } = useSession();
  return useQuery({ queryKey: ["accounts", user?.id], queryFn: () => accountsApi.list(user!.id), enabled: Boolean(user?.id) });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (data: Partial<Account>) => accountsApi.create(user!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (id: string) => accountsApi.remove(user!.id, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
