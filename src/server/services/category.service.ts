import { categoryRepository } from "@/server/repositories/category.repository";

export const categoryService = {
  list: (userId: string) => categoryRepository.findAllByUser(userId),

  async create(userId: string, data: { name: string; icon?: string; color?: string; type: string; parentId?: string | null }) {
    if (data.parentId) {
      const parent = await categoryRepository.findById(data.parentId, userId);
      if (!parent) throw new Error("Categoría padre no encontrada");
    }
    return categoryRepository.create({ ...data, userId });
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{ name: string; icon: string | null; color: string | null; type: string; parentId: string | null }>,
  ) {
    const category = await categoryRepository.findById(id, userId);
    if (!category) throw new Error("Categoría no encontrada");
    if (data.parentId === id) throw new Error("Una categoría no puede ser su propio padre");
    await categoryRepository.update(id, userId, data);
    return categoryRepository.findById(id, userId);
  },

  async remove(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);
    if (!category) throw new Error("Categoría no encontrada");
    await categoryRepository.remove(id, userId);
  },
};
