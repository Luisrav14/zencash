import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { transactionService } from "@/server/services/transaction.service";
import type { AuthContext } from "@/server/middlewares/withAuth";

const createSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  date: z.coerce.date(),
  note: z.string().optional(),
  tags: z.string().optional(),
  categoryId: z.string().min(1),
  accountId: z.string().min(1),
});

const updateSchema = createSchema.partial();

export const transactionController = {
  async list(req: NextRequest, ctx: AuthContext) {
    const { searchParams } = new URL(req.url);
    const transactions = await transactionService.list(ctx.userId, {
      accountId: searchParams.get("accountId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
    });
    return NextResponse.json({ transactions });
  },

  async create(req: NextRequest, ctx: AuthContext) {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const transaction = await transactionService.create(ctx.userId, parsed.data);
    return NextResponse.json({ transaction }, { status: 201 });
  },

  async update(req: NextRequest, ctx: AuthContext, id: string) {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const transaction = await transactionService.update(id, ctx.userId, parsed.data);
      return NextResponse.json({ transaction });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar movimiento" }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: AuthContext, id: string) {
    try {
      await transactionService.remove(id, ctx.userId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar movimiento" }, { status: 400 });
    }
  },
};
