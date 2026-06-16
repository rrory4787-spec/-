import { cookies } from "next/headers"
import crypto from "crypto"

const COOKIE_NAME = "ak_admin_session"
const ONE_WEEK = 60 * 60 * 24 * 7

function getSecret() {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me"
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex")
}

function createToken() {
  const issued = Date.now().toString()
  const sig = sign(issued)
  return `${issued}.${sig}`
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  const [issued, sig] = token.split(".")
  if (!issued || !sig) return false
  if (sign(issued) !== sig) return false
  const age = Date.now() - Number(issued)
  return age >= 0 && age < ONE_WEEK * 1000
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  // constant-time compare
  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function createSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: ONE_WEEK,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return verifyToken(store.get(COOKIE_NAME)?.value)
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized")
  }
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}
