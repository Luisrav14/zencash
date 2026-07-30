import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { accountService } from "@/server/services/account.service";
import type { AuthContext } from "@/server/middlewares/withAuth";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["cash", "card", "bank"]),
  initialBalance: z.number().default(0),
  color: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const accountController = {
  async list(_req: NextRequest, ctx: AuthContext) {
    const accounts = await accountService.list(ctx.userId);
    return NextResponse.json({ accounts });
  },

  async create(req: NextRequest, ctx: AuthContext) {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const account = await accountService.create(ctx.userId, parsed.data);
    return NextResponse.json({ account }, { status: 201 });
  },

  async update(req: NextRequest, ctx: AuthContext, id: string) {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const account = await accountService.update(id, ctx.userId, parsed.data);
      return NextResponse.json({ account });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar cuenta" }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: AuthContext, id: string) {
    try {
      await accountService.remove(id, ctx.userId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar cuenta" }, { status: 400 });
    }
  },
};
