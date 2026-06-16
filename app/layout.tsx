import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Cairo, Tajawal } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
})

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "المطبخ الأمريكي | كتالوج المنتجات",
  description:
    "كتالوج المطبخ الأمريكي ذ.م.م - مطابخ، خزائن حائط، أبواب، وحدات تلفزيون وأكثر. الدوحة، قطر.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#7a1420",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
