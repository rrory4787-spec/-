"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

export default function PDFPage() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function handleGeneratePDF(type: "full" | "section", sectionId?: number) {
    setGenerating(true)
    try {
      const url = type === "full" 
        ? "/api/admin/pdf/generate"
        : `/api/admin/pdf/generate-section?sectionId=${sectionId}`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to generate PDF")

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = type === "full" 
        ? "catalog.pdf" 
        : `section-${sectionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      toast.success("تم تحميل الملف بنجاح")
    } catch (error) {
      toast.error("فشل تحميل الملف")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">تحميل PDF</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* تحميل الكتالوج كاملاً */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-2">تحميل الكتالوج الكامل</h2>
            <p className="text-sm text-muted-foreground">
              قم بتحميل الكتالوج كاملاً بصيغة PDF على شكل كتاب
            </p>
          </div>
          <Button
            onClick={() => handleGeneratePDF("full")}
            disabled={generating}
            className="w-full gap-2"
            size="lg"
          >
            <Download className="w-4 h-4" />
            {generating ? "جاري التحضير..." : "تحميل الكتالوج"}
          </Button>
        </div>

        {/* معلومات إضافية */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-bold mb-4">معلومات التحميل</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ يتضمن صفحة الغلاف والمقدمة والتراث</li>
            <li>✓ يتضمن جميع الأقسام والصور</li>
            <li>✓ ينتهي بصفحة التواصل</li>
            <li>✓ صيغة PDF محسّنة للطباعة</li>
            <li>✓ دعم اللغة العربية كاملاً</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
