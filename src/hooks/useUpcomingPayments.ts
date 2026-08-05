import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { upcomingPaymentsApi, type UpcomingPayment } from "@/lib/client/api";
import { useSession } from "@/lib/client/useSession";

export function useUpcomingPayments() {
  const { user } = useSession();
  return useQuery({ queryKey: ["upcoming-payments", user?.id], queryFn: () => upcomingPaymentsApi.list(user!.id), enabled: Boolean(user?.id) });
}

export function useCreateUpcomingPayment() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (data: Partial<UpcomingPayment>) => upcomingPaymentsApi.create(user!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upcoming-payments"] }),
  });
}

export function useMarkUpcomingPaymentPaid() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (id: string) => upcomingPaymentsApi.update(user!.id, id, { paid: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcoming-payments"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteUpcomingPayment() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (id: string) => upcomingPaymentsApi.remove(user!.id, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upcoming-payments"] }),
  });
}
