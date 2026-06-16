"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { toast } from "sonner"

export function ShareMenu({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.origin + "/catalog" : ""
    const shareData = {
      title: "كتالوج الآش الأمريكي",
      text: "تصفح كتالوج منتجات الآش الأمريكي",
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch {
      // user cancelled or unsupported -> fall through to copy
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("تم نسخ الرابط")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("تعذّر نسخ الرابط")
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleShare} className={`gap-1.5 ${className ?? ""}`}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span className="hidden sm:inline">مشاركة</span>
    </Button>
  )
}
