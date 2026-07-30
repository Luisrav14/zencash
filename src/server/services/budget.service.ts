import { budgetRepository } from "@/server/repositories/budget.repository";

export const budgetService = {
  list: (userId: string) => budgetRepository.findAllByUser(userId),

  create(userId: string, data: { categoryId: string; amount: number; period: string }) {
    return budgetRepository.create({ ...data, userId });
  },

  async update(id: string, userId: string, data: Partial<{ categoryId: string; amount: number; period: string }>) {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) throw new Error("Presupuesto no encontrado");
    await budgetRepository.update(id, userId, data);
    return budgetRepository.findById(id, userId);
  },

  async remove(id: string, userId: string) {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) throw new Error("Presupuesto no encontrado");
    await budgetRepository.remove(id, userId);
  },
};
