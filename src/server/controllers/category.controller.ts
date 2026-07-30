import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { categoryService } from "@/server/services/category.service";
import type { AuthContext } from "@/server/middlewares/withAuth";

const createSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(["income", "expense"]),
  parentId: z.string().nullable().optional(),
});

const updateSchema = createSchema.partial();

export const categoryController = {
  async list(_req: NextRequest, ctx: AuthContext) {
    const categories = await categoryService.list(ctx.userId);
    return NextResponse.json({ categories });
  },

  async create(req: NextRequest, ctx: AuthContext) {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const category = await categoryService.create(ctx.userId, parsed.data);
      return NextResponse.json({ category }, { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear categoría" }, { status: 400 });
    }
  },

  async update(req: NextRequest, ctx: AuthContext, id: string) {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const category = await categoryService.update(id, ctx.userId, parsed.data);
      return NextResponse.json({ category });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar categoría" }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: AuthContext, id: string) {
    try {
      await categoryService.remove(id, ctx.userId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar categoría" }, { status: 400 });
    }
  },
};
