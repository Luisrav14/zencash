import { withAuth } from "@/server/middlewares/withAuth";
import { NextResponse } from "next/server";

export const GET = withAuth((_req, ctx) => {
  return NextResponse.json({ user: { id: ctx.userId, email: ctx.email } });
});
