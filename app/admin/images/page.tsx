"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Page {
  id: number
  section_id: number
  image_url: string
  caption: string
  position: number
}

interface Section {
  id: number
  title: string
}

export default function ImagesPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [images, setImages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newImage, setNewImage] = useState({ image_url: "", caption: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState({ image_url: "", caption: "" })

  useEffect(() => {
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchImages(selectedSection)
    }
  }, [selectedSection])

  async function fetchSections() {
    try {
      const res = await fetch("/api/admin/sections")
      if (res.ok) {
        const data = await res.json()
        setSections(data)
        if (data.length > 0) {
          setSelectedSection(data[0].id)
        }
      }
    } catch (error) {
      toast.error("فشل تحميل الأقسام")
    } finally {
      setLoading(false)
    }
  }

  async function fetchImages(sectionId: number) {
    try {
      const res = await fetch(`/api/admin/sections/${sectionId}/images`)
      if (res.ok) {
        const data = await res.json()
        setImages(data)
      }
    } catch (error) {
      toast.error("فشل تحميل الصور")
    }
  }

  async function handleAddImage() {
    if (!newImage.image_url.trim() || !selectedSection) {
      toast.error("يرجى ملء جميع الحقول")
      return
    }

    if (images.length >= 30) {
      toast.error("لا يمكن إضافة أكثر من 30 صورة لكل قسم")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/sections/${selectedSection}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: newImage.image_url,
          caption: newImage.caption,
          position: images.length + 1,
        }),
      })

      if (res.ok) {
        toast.success("تم إضافة الصورة بنجاح")
        setNewImage({ image_url: "", caption: "" })
        fetchImages(selectedSection)
      } else {
        toast.error("فشل إضافة الصورة")
      }
    } catch (error) {
      toast.error("خطأ في الإضافة")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateImage(imageId: number) {
    if (!editData.image_url.trim()) {
      toast.error("يرجى ملء رابط الصورة")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/images/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })

      if (res.ok) {
        toast.success("تم التحديث بنجاح")
        setEditingId(null)
        if (selectedSection) {
          fetchImages(selectedSection)
        }
      } else {
        toast.error("فشل التحديث")
      }
    } catch (error) {
      toast.error("خطأ في التحديث")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return

    try {
      const res = await fetch(`/api/admin/images/${imageId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("تم الحذف بنجاح")
        if (selectedSection) {
          fetchImages(selectedSection)
        }
      } else {
        toast.error("فشل الحذف")
      }
    } catch (error) {
      toast.error("خطأ في الحذف")
    }
  }

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>
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
        <h1 className="text-3xl font-bold">إدارة الصور</h1>
      </div>

      {/* اختيار القسم */}
      <div className="flex gap-2 flex-wrap">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={selectedSection === section.id ? "default" : "outline"}
            onClick={() => setSelectedSection(section.id)}
          >
            {section.title}
          </Button>
        ))}
      </div>

      {selectedSection && (
        <div className="space-y-6">
          {/* إضافة صورة جديدة */}
          <div className="max-w-2xl rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">إضافة صورة جديدة</h2>
              <span className="text-sm text-muted-foreground">
                {images.length} / 30
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رابط الصورة</label>
              <input
                type="text"
                value={newImage.image_url}
                onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">التعليق</label>
              <input
                type="text"
                value={newImage.caption}
                onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                placeholder="وصف الصورة"
              />
            </div>

            <Button
              onClick={handleAddImage}
              disabled={saving || images.length >= 30}
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              إضافة الصورة
            </Button>
          </div>

          {/* قائمة الصور */}
          <div className="space-y-3">
            {images.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد صور حتى الآن
              </div>
            ) : (
              images.map((image, index) => (
                <div
                  key={image.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  {editingId === image.id ? (
                    // نموذج التحرير
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                        <input
                          type="text"
                          value={editData.image_url}
                          onChange={(e) =>
                            setEditData({ ...editData, image_url: e.target.value })
                          }
                          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">التعليق</label>
                        <input
                          type="text"
                          value={editData.caption}
                          onChange={(e) =>
                            setEditData({ ...editData, caption: e.target.value })
                          }
                          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateImage(image.id)}
                          disabled={saving}
                          className="flex-1"
                        >
                          حفظ
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // عرض الصورة
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.caption}
                          className="h-24 w-24 rounded object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          الصورة #{index + 1}
                        </p>
                        {image.caption && (
                          <p className="text-foreground mt-1">{image.caption}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {image.image_url}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(image.id)
                            setEditData({
                              image_url: image.image_url,
                              caption: image.caption,
                            })
                          }}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
