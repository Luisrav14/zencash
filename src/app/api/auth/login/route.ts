import { NextRequest } from "next/server";
import { authController } from "@/server/controllers/auth.controller";

export function POST(req: NextRequest) {
  return authController.login(req);
}
