import { query } from "@/lib/db"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: Request) {
  try {
    await requireAuth()
    const data = await request.json()

    await query(
      `UPDATE company SET intro_title = $1, intro_text = $2, heritage_text = $3 WHERE id = 1`,
      [data.intro_title, data.intro_text, data.heritage_text]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error updating texts" }, { status: 500 })
  }
}
