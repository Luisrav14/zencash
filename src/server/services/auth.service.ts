import { hashPassword, verifyPassword } from "@/lib/hash";
import { userRepository } from "@/server/repositories/user.repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";

const DEFAULT_CATEGORIES = [
  { name: "Sueldo", type: "income", icon: "💼" },
  { name: "Comida", type: "expense", icon: "🍔" },
  { name: "Transporte", type: "expense", icon: "🚗" },
  { name: "Hogar", type: "expense", icon: "🏠" },
  { name: "Entretenimiento", type: "expense", icon: "🎮" },
  { name: "Salud", type: "expense", icon: "💊" },
  { name: "Ahorro", type: "income", icon: "💰" },
];

export const authService = {
  async register(email: string, password: string, name?: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error("El correo ya está registrado");
    }
    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({ email, passwordHash, name });

    const { prisma } = await import("@/lib/prisma");
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.id })),
    });

    return authService.issueTokens(user.id, user.email);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Credenciales inválidas");
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error("Credenciales inválidas");
    return authService.issueTokens(user.id, user.email);
  },

  async refresh(refreshToken: string) {
    const payload = await verifyRefreshToken(refreshToken);
    return authService.issueTokens(payload.sub, payload.email);
  },

  async issueTokens(userId: string, email: string) {
    const accessToken = await signAccessToken({ sub: userId, email });
    const refreshToken = await signRefreshToken({ sub: userId, email });
    return { accessToken, refreshToken, user: { id: userId, email } };
  },
};
