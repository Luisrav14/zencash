import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { upcomingPaymentService } from "@/server/services/upcomingPayment.service";
import type { AuthContext } from "@/server/middlewares/withAuth";

const createSchema = z.object({
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  note: z.string().optional(),
  categoryId: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({ paid: z.boolean().optional() });

export const upcomingPaymentController = {
  async list(_req: NextRequest, ctx: AuthContext) {
    const payments = await upcomingPaymentService.list(ctx.userId);
    return NextResponse.json({ payments });
  },

  async create(req: NextRequest, ctx: AuthContext) {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const payment = await upcomingPaymentService.create(ctx.userId, parsed.data);
    return NextResponse.json({ payment }, { status: 201 });
  },

  async update(req: NextRequest, ctx: AuthContext, id: string) {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const payment = await upcomingPaymentService.update(id, ctx.userId, parsed.data);
      return NextResponse.json({ payment });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar pago" }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: AuthContext, id: string) {
    try {
      await upcomingPaymentService.remove(id, ctx.userId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar pago" }, { status: 400 });
    }
  },
};
