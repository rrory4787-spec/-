"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Company {
  id: number
  name_ar: string
  name_en: string
  tagline: string
  location: string
  phone1: string
  phone2: string
  phone3: string
  po_box: string
  email: string
  whatsapp: string
  warranty: string
  logo_url: string
  intro_title: string
  intro_text: string
  heritage_text: string
}

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [])

  async function fetchCompany() {
    try {
      const res = await fetch("/api/admin/company")
      if (res.ok) {
        const data = await res.json()
        setCompany(data)
      }
    } catch (error) {
      toast.error("فشل تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!company) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      })

      if (res.ok) {
        toast.success("تم الحفظ بنجاح")
      } else {
        toast.error("فشل الحفظ")
      }
    } catch (error) {
      toast.error("خطأ في الحفظ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>
  }

  if (!company) {
    return <div className="text-center py-12">لم يتم العثور على بيانات</div>
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
        <h1 className="text-3xl font-bold">المعلومات العامة</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* اسم الشركة */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم الشركة (عربي)</label>
            <input
              type="text"
              value={company.name_ar}
              onChange={(e) => setCompany({ ...company, name_ar: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">اسم الشركة (إنجليزي)</label>
            <input
              type="text"
              value={company.name_en}
              onChange={(e) => setCompany({ ...company, name_en: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
        </div>

        {/* الشعار والضمان */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">رابط الشعار</label>
            <input
              type="text"
              value={company.logo_url}
              onChange={(e) => setCompany({ ...company, logo_url: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الضمان</label>
            <input
              type="text"
              value={company.warranty}
              onChange={(e) => setCompany({ ...company, warranty: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
        </div>

        {/* الشعار والموقع */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">الشعار (Tagline)</label>
            <input
              type="text"
              value={company.tagline}
              onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الموقع</label>
            <input
              type="text"
              value={company.location}
              onChange={(e) => setCompany({ ...company, location: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
        </div>

        {/* الهواتف */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">الهاتف 1</label>
            <input
              type="text"
              value={company.phone1}
              onChange={(e) => setCompany({ ...company, phone1: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الهاتف 2</label>
            <input
              type="text"
              value={company.phone2}
              onChange={(e) => setCompany({ ...company, phone2: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الهاتف 3</label>
            <input
              type="text"
              value={company.phone3}
              onChange={(e) => setCompany({ ...company, phone3: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
        </div>

        {/* البريد والواتس */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">واتساب الصيانة</label>
            <input
              type="text"
              value={company.whatsapp}
              onChange={(e) => setCompany({ ...company, whatsapp: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
        </div>

        {/* صندوق بريد وعنوان الفاتورة */}
        <div>
          <label className="block text-sm font-medium mb-2">صندوق البريد (PO Box)</label>
          <input
            type="text"
            value={company.po_box}
            onChange={(e) => setCompany({ ...company, po_box: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
          />
        </div>

        {/* عنوان المقدمة */}
        <div>
          <label className="block text-sm font-medium mb-2">عنوان المقدمة</label>
          <input
            type="text"
            value={company.intro_title}
            onChange={(e) => setCompany({ ...company, intro_title: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
          />
        </div>

        {/* نص المقدمة */}
        <div>
          <label className="block text-sm font-medium mb-2">نص المقدمة</label>
          <textarea
            value={company.intro_text}
            onChange={(e) => setCompany({ ...company, intro_text: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground resize-none"
          />
        </div>

        {/* نص التراث */}
        <div>
          <label className="block text-sm font-medium mb-2">نص التراث</label>
          <textarea
            value={company.heritage_text}
            onChange={(e) => setCompany({ ...company, heritage_text: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground resize-none"
          />
        </div>

        {/* زر الحفظ */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
          size="lg"
        >
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  )
}
