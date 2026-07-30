import { prisma } from "@/lib/prisma";

export const budgetRepository = {
  findAllByUser(userId: string) {
    return prisma.budget.findMany({ where: { userId }, include: { category: true } });
  },
  findById(id: string, userId: string) {
    return prisma.budget.findFirst({ where: { id, userId } });
  },
  create(data: { categoryId: string; amount: number; period: string; userId: string }) {
    return prisma.budget.create({ data });
  },
  update(id: string, userId: string, data: Partial<{ categoryId: string; amount: number; period: string }>) {
    return prisma.budget.updateMany({ where: { id, userId }, data });
  },
  remove(id: string, userId: string) {
    return prisma.budget.deleteMany({ where: { id, userId } });
  },
};
