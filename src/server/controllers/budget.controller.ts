import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { budgetService } from "@/server/services/budget.service";
import type { AuthContext } from "@/server/middlewares/withAuth";

const createSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  period: z.enum(["monthly"]).default("monthly"),
});

const updateSchema = createSchema.partial();

export const budgetController = {
  async list(_req: NextRequest, ctx: AuthContext) {
    const budgets = await budgetService.list(ctx.userId);
    return NextResponse.json({ budgets });
  },

  async create(req: NextRequest, ctx: AuthContext) {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const budget = await budgetService.create(ctx.userId, parsed.data);
    return NextResponse.json({ budget }, { status: 201 });
  },

  async update(req: NextRequest, ctx: AuthContext, id: string) {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const budget = await budgetService.update(id, ctx.userId, parsed.data);
      return NextResponse.json({ budget });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar presupuesto" }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: AuthContext, id: string) {
    try {
      await budgetService.remove(id, ctx.userId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar presupuesto" }, { status: 400 });
    }
  },
};
