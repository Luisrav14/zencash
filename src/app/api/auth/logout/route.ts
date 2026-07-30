import { authController } from "@/server/controllers/auth.controller";

export function POST() {
  return authController.logout();
}
