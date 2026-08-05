import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type Category } from "@/lib/client/api";
import { useSession } from "@/lib/client/useSession";

export function useCategories() {
  const { user } = useSession();
  return useQuery({ queryKey: ["categories", user?.id], queryFn: () => categoriesApi.list(user!.id), enabled: Boolean(user?.id) });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (data: Partial<Category>) => categoriesApi.create(user!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(user!.id, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
