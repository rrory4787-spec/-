import { createSession, checkPassword } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await createSession()
  return NextResponse.json({ success: true })
}
