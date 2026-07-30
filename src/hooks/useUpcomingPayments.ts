import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { upcomingPaymentsApi, type UpcomingPayment } from "@/lib/client/api";

export function useUpcomingPayments() {
  return useQuery({ queryKey: ["upcoming-payments"], queryFn: upcomingPaymentsApi.list });
}

export function useCreateUpcomingPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UpcomingPayment>) => upcomingPaymentsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upcoming-payments"] }),
  });
}

export function useMarkUpcomingPaymentPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => upcomingPaymentsApi.update(id, { paid: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcoming-payments"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteUpcomingPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => upcomingPaymentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upcoming-payments"] }),
  });
}
