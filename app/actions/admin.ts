"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put, del } from "@vercel/blob"
import { query } from "@/lib/db"
import {
  checkPassword,
  createSession,
  destroySession,
  requireAuth,
} from "@/lib/auth"

/* ---------- Auth ---------- */

export async function loginAction(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "")
  if (!checkPassword(password)) {
    return { error: "كلمة المرور غير صحيحة" }
  }
  await createSession()
  redirect("/admin")
}

export async function logoutAction() {
  await destroySession()
  redirect("/admin")
}

/* ---------- Company ---------- */

export async function updateCompany(formData: FormData) {
  await requireAuth()
  const fields = [
    "name_ar",
    "name_en",
    "tagline",
    "location",
    "phone1",
    "phone2",
    "phone3",
    "po_box",
    "email",
    "whatsapp",
    "warranty",
    "intro_title",
    "intro_text",
    "heritage_text",
  ]
  const values = fields.map((f) => String(formData.get(f) ?? ""))
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ")
  await query(
    `UPDATE company SET ${setClause}, updated_at = now() WHERE id = 1`,
    values,
  )
  revalidatePath("/")
  revalidatePath("/catalog")
  revalidatePath("/admin")
  revalidatePath("/print")
}

export async function updateCompanyLogo(formData: FormData) {
  await requireAuth()
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return
  const blob = await put(`company/logo-${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  })
  await query("UPDATE company SET logo_url = $1 WHERE id = 1", [blob.url])
  revalidatePath("/admin")
  revalidatePath("/")
}

/* ---------- Sections ---------- */

export async function updateSection(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  await query(
    `UPDATE sections SET title = $1, subtitle = $2, description = $3 WHERE id = $4`,
    [
      String(formData.get("title") ?? ""),
      String(formData.get("subtitle") ?? ""),
      String(formData.get("description") ?? ""),
      id,
    ],
  )
  revalidatePath("/")
  revalidatePath("/catalog")
  revalidatePath("/admin")
}

export async function uploadSectionCover(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return
  const blob = await put(`sections/${id}-${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  })
  await query("UPDATE sections SET cover_image_url = $1 WHERE id = $2", [blob.url, id])
  revalidatePath("/")
  revalidatePath("/catalog")
  revalidatePath("/admin")
}

/* ---------- Pages (images inside a section) ---------- */

export async function addPage(formData: FormData) {
  await requireAuth()
  const sectionId = Number(formData.get("section_id"))
  const file = formData.get("file") as File | null
  const caption = String(formData.get("caption") ?? "")
  if (!file || file.size === 0) return

  const blob = await put(`pages/${sectionId}-${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  })
  const posRows = await query<{ max: number | null }>(
    "SELECT MAX(position) as max FROM pages WHERE section_id = $1",
    [sectionId],
  )
  const nextPos = (posRows[0]?.max ?? 0) + 1
  await query(
    "INSERT INTO pages (section_id, image_url, caption, position) VALUES ($1, $2, $3, $4)",
    [sectionId, blob.url, caption, nextPos],
  )
  revalidatePath("/")
  revalidatePath("/catalog")
  revalidatePath("/admin")
}

export async function updatePageCaption(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  await query("UPDATE pages SET caption = $1 WHERE id = $2", [
    String(formData.get("caption") ?? ""),
    id,
  ])
  revalidatePath("/catalog")
  revalidatePath("/admin")
}

export async function deletePage(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const rows = await query<{ image_url: string }>(
    "SELECT image_url FROM pages WHERE id = $1",
    [id],
  )
  const url = rows[0]?.image_url
  await query("DELETE FROM pages WHERE id = $1", [id])
  if (url) {
    try {
      await del(url)
    } catch {
      // ignore blob deletion errors
    }
  }
  revalidatePath("/")
  revalidatePath("/catalog")
  revalidatePath("/admin")
}

export async function movePage(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const dir = String(formData.get("dir")) // "up" | "down"
  const rows = await query<{ section_id: number; position: number }>(
    "SELECT section_id, position FROM pages WHERE id = $1",
    [id],
  )
  if (!rows[0]) return
  const { section_id, position } = rows[0]
  const op = dir === "up" ? "<" : ">"
  const order = dir === "up" ? "DESC" : "ASC"
  const neighbor = await query<{ id: number; position: number }>(
    `SELECT id, position FROM pages WHERE section_id = $1 AND position ${op} $2 ORDER BY position ${order} LIMIT 1`,
    [section_id, position],
  )
  if (!neighbor[0]) return
  await query("UPDATE pages SET position = $1 WHERE id = $2", [neighbor[0].position, id])
  await query("UPDATE pages SET position = $1 WHERE id = $2", [position, neighbor[0].id])
  revalidatePath("/catalog")
  revalidatePath("/admin")
}
