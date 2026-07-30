import { prisma } from "@/lib/prisma";

export const categoryRepository = {
  findAllByUser(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      include: { children: true },
      orderBy: { name: "asc" },
    });
  },
  findById(id: string, userId: string) {
    return prisma.category.findFirst({ where: { id, userId } });
  },
  create(data: { name: string; icon?: string; color?: string; type: string; parentId?: string | null; userId: string }) {
    return prisma.category.create({ data });
  },
  update(
    id: string,
    userId: string,
    data: Partial<{
      name: string;
      icon: string | null;
      color: string | null;
      type: string;
      parentId: string | null;
    }>,
  ) {
    return prisma.category.updateMany({ where: { id, userId }, data });
  },
  remove(id: string, userId: string) {
    return prisma.category.deleteMany({ where: { id, userId } });
  },
};
