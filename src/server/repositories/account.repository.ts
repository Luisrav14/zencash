import { prisma } from "@/lib/prisma";

export const accountRepository = {
  findAllByUser(userId: string) {
    return prisma.account.findMany({ where: { userId }, orderBy: { name: "asc" } });
  },
  findById(id: string, userId: string) {
    return prisma.account.findFirst({ where: { id, userId } });
  },
  create(data: { name: string; type: string; initialBalance?: number; color?: string; userId: string }) {
    return prisma.account.create({ data });
  },
  update(id: string, userId: string, data: Partial<{ name: string; type: string; initialBalance: number; color: string | null }>) {
    return prisma.account.updateMany({ where: { id, userId }, data });
  },
  remove(id: string, userId: string) {
    return prisma.account.deleteMany({ where: { id, userId } });
  },
};
