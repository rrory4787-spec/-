import { destroySession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  await destroySession()
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXTAUTH_URL || "http://localhost:3000"))
}
