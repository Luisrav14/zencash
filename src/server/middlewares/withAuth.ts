import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

export type AuthContext = {
  userId: string;
  email: string;
};

type AuthedHandler<TParams = Record<string, string>> = (
  req: NextRequest,
  ctx: AuthContext,
  routeParams: { params: Promise<TParams> },
) => Promise<NextResponse> | NextResponse;

export function withAuth<TParams = Record<string, string>>(handler: AuthedHandler<TParams>) {
  return async (req: NextRequest, routeParams: { params: Promise<TParams> } = { params: Promise.resolve({} as TParams) }) => {
    const token = req.cookies.get("access_token")?.value ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    try {
      const payload = await verifyAccessToken(token);
      return handler(req, { userId: payload.sub, email: payload.email }, routeParams);
    } catch {
      return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
    }
  };
}
