"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Upload } from "lucide-react"
import { toast } from "sonner"

interface AdminStats {
  sectionsCount: number
  imagesCount: number
  hasIntro: boolean
  hasHeritage: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      toast.error("فشل تحميل الإحصائيات")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">إدارة الكتالوج والصور والأقسام</p>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">الأقسام</p>
            <p className="text-3xl font-bold text-primary">{stats.sectionsCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">الصور</p>
            <p className="text-3xl font-bold text-primary">{stats.imagesCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">مقدمة</p>
            <p className="text-lg">{stats.hasIntro ? "✓ موجودة" : "✗ غير موجودة"}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">التراث</p>
            <p className="text-lg">{stats.hasHeritage ? "✓ موجود" : "✗ غير موجود"}</p>
          </div>
        </div>
      )}

      {/* الخيارات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/company">
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">المعلومات العامة</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  تعديل بيانات الشركة والشعار
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">تعديل</Button>
          </div>
        </Link>

        <Link href="/admin/sections">
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">الأقسام</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  إضافة وتعديل وحذف الأقسام
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">إدارة</Button>
          </div>
        </Link>

        <Link href="/admin/images">
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">الصور</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  إدارة صور الأقسام (حتى 30 صورة لكل قسم)
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">إدارة</Button>
          </div>
        </Link>

        <Link href="/admin/texts">
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">النصوص</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  تعديل المقدمة والتراث والتواصل
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">تعديل</Button>
          </div>
        </Link>

        <Link href="/admin/pdf">
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">تحميل PDF</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  تحميل الكتالوج بصيغة PDF
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">تحميل</Button>
          </div>
        </Link>

        <Link href="/admin/preview">
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">معاينة</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  معاينة الكتالوج قبل النشر
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">معاينة</Button>
          </div>
        </Link>
      </div>
    </div>
  )
}
