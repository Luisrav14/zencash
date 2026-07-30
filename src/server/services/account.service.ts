import { accountRepository } from "@/server/repositories/account.repository";

export const accountService = {
  list: (userId: string) => accountRepository.findAllByUser(userId),

  create(userId: string, data: { name: string; type: string; initialBalance?: number; color?: string }) {
    return accountRepository.create({ ...data, userId });
  },

  async update(id: string, userId: string, data: Partial<{ name: string; type: string; initialBalance: number; color: string | null }>) {
    const account = await accountRepository.findById(id, userId);
    if (!account) throw new Error("Cuenta no encontrada");
    await accountRepository.update(id, userId, data);
    return accountRepository.findById(id, userId);
  },

  async remove(id: string, userId: string) {
    const account = await accountRepository.findById(id, userId);
    if (!account) throw new Error("Cuenta no encontrada");
    await accountRepository.remove(id, userId);
  },
};
