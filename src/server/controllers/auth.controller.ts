import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/server/services/auth.service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().optional(),
});

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

function setAuthCookies(res: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export const authController = {
  async register(req: NextRequest) {
    const parsed = credentialsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const { user, accessToken, refreshToken } = await authService.register(parsed.data.email, parsed.data.password, parsed.data.name);
      const res = NextResponse.json({ user }, { status: 201 });
      setAuthCookies(res, { accessToken, refreshToken });
      return res;
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al registrar" }, { status: 400 });
    }
  },

  async login(req: NextRequest) {
    const schema = credentialsSchema.pick({ email: true, password: true });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const { user, accessToken, refreshToken } = await authService.login(parsed.data.email, parsed.data.password);
      const res = NextResponse.json({ user });
      setAuthCookies(res, { accessToken, refreshToken });
      return res;
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error al iniciar sesión" }, { status: 401 });
    }
  },

  async refresh(req: NextRequest) {
    const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
    }
    try {
      const tokens = await authService.refresh(refreshToken);
      const res = NextResponse.json({ user: tokens.user });
      setAuthCookies(res, tokens);
      return res;
    } catch {
      return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
    }
  },

  async logout() {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  },
};
