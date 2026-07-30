import { transactionRepository } from "@/server/repositories/transaction.repository";

export const transactionService = {
  list: (userId: string, filters?: { accountId?: string; categoryId?: string }) => transactionRepository.findAllByUser(userId, filters),

  create(
    userId: string,
    data: {
      amount: number;
      type: string;
      date: Date;
      note?: string;
      tags?: string;
      categoryId: string;
      accountId: string;
    },
  ) {
    return transactionRepository.create({ ...data, userId });
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      amount: number;
      type: string;
      date: Date;
      note: string | null;
      tags: string | null;
      categoryId: string;
      accountId: string;
    }>,
  ) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) throw new Error("Movimiento no encontrado");
    await transactionRepository.update(id, userId, data);
    return transactionRepository.findById(id, userId);
  },

  async remove(id: string, userId: string) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) throw new Error("Movimiento no encontrado");
    await transactionRepository.remove(id, userId);
  },
};
