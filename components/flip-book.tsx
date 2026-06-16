"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Company, SectionWithPages } from "@/lib/catalog"
import { buildPages } from "@/lib/build-pages"
import { BookLeaf } from "@/components/book-leaf"
import { Button } from "@/components/ui/button"
import { ShareMenu } from "@/components/share-menu"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Download,
  List,
  X,
} from "lucide-react"

export function FlipBook({
  company,
  sections,
  initialSlug,
}: {
  company: Company
  sections: SectionWithPages[]
  initialSlug?: string
}) {
  const pages = useMemo(() => buildPages(company, sections), [company, sections])

  // first page index of each section (for the table of contents)
  const sectionStarts = useMemo(() => {
    const map: { slug: string; title: string; page: number }[] = []
    pages.forEach((p, i) => {
      if (p.kind === "section-title") map.push({ slug: p.section.slug, title: p.section.title, page: i })
    })
    return map
  }, [pages])

  const [perView, setPerView] = useState(1)
  const [page, setPage] = useState(0)
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 820px)")
    const apply = () => setPerView(mq.matches ? 2 : 1)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  // jump to initial section once
  useEffect(() => {
    if (!initialSlug) return
    const target = sectionStarts.find((s) => s.slug === initialSlug)
    if (target) setPage(target.page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // snap to even page when showing spreads
  useEffect(() => {
    if (perView === 2 && page % 2 !== 0) setPage((p) => p - 1)
  }, [perView, page])

  const maxPage = pages.length - 1
  const canPrev = page > 0
  const canNext = page + perView <= maxPage

  const goNext = useCallback(() => {
    setPage((p) => Math.min(p + perView, maxPage))
  }, [perView, maxPage])

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(p - perView, 0))
  }, [perView])

  // keyboard: in RTL, ArrowLeft = next, ArrowRight = prev
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext()
      else if (e.key === "ArrowRight") goPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev])

  const rightPage = pages[page]
  const leftPage = perView === 2 ? pages[page + 1] : undefined

  const currentSectionTitle = useMemo(() => {
    let title = ""
    for (let i = 0; i <= page; i++) {
      const p = pages[i]
      if (p.kind === "section-title") title = p.section.title
    }
    return title
  }, [page, pages])

  return (
    <div className="flex min-h-dvh flex-col bg-[#1a1411]">
      {/* Toolbar */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/10 bg-[#15110f]/95 px-3 py-2.5 backdrop-blur md:px-5">
        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/" aria-label="الصفحة الرئيسية">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTocOpen((v) => !v)}
            className="gap-1.5 text-white hover:bg-white/10 hover:text-white"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">الأقسام</span>
          </Button>
        </div>

        <div className="truncate px-2 text-center font-heading text-sm font-bold text-amber-100 md:text-base">
          {currentSectionTitle || company.name_ar}
        </div>

        <div className="flex items-center gap-1.5">
          <ShareMenu className="text-white hover:bg-white/10 hover:text-white" />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-white hover:bg-white/10 hover:text-white"
          >
            <a href="/print" target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </a>
          </Button>
        </div>
      </header>

      {/* Table of contents drawer */}
      {tocOpen && (
        <div className="no-print fixed inset-0 z-40 flex" onClick={() => setTocOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <nav
            className="relative ms-auto h-full w-72 max-w-[80%] overflow-y-auto bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-primary">الأقسام</h3>
              <Button variant="ghost" size="icon" onClick={() => setTocOpen(false)} aria-label="إغلاق">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ul className="flex flex-col gap-1">
              <li>
                <button
                  onClick={() => {
                    setPage(0)
                    setTocOpen(false)
                  }}
                  className="w-full rounded-md px-3 py-2 text-right text-sm font-medium hover:bg-secondary"
                >
                  الغلاف
                </button>
              </li>
              {sectionStarts.map((s) => (
                <li key={s.slug}>
                  <button
                    onClick={() => {
                      setPage(perView === 2 ? s.page - (s.page % 2) : s.page)
                      setTocOpen(false)
                    }}
                    className="w-full rounded-md px-3 py-2 text-right text-sm font-medium hover:bg-secondary"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="/print"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
                >
                  <Download className="h-4 w-4" /> تحميل الكتالوج PDF
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Book stage */}
      <div className="flex flex-1 items-center justify-center px-2 py-5 md:px-6 md:py-8">
        <div className="flex w-full max-w-5xl items-center gap-1 md:gap-3">
          {/* prev (right side in RTL) */}
          <Button
            variant="secondary"
            size="icon"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="السابق"
            className="shrink-0 rounded-full shadow-lg disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div
            key={page}
            className="book-page-shadow animate-page-flip relative flex w-full overflow-hidden rounded-lg bg-black"
            style={{ aspectRatio: perView === 2 ? "16 / 10" : "3 / 4" }}
          >
            {/* right page = earlier page in RTL */}
            <div className="relative h-full flex-1 overflow-hidden">
              {rightPage && <BookLeaf page={rightPage} />}
            </div>
            {perView === 2 && (
              <>
                <div className="book-spine pointer-events-none absolute inset-y-0 left-1/2 z-10 w-8 -translate-x-1/2" />
                <div className="relative h-full flex-1 overflow-hidden border-s border-black/20">
                  {leftPage ? (
                    <BookLeaf page={leftPage} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#0e0b0a] text-white/30">
                      <img src="/logo.png" alt="" className="h-16 w-16 object-contain opacity-30" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* next (left side in RTL) */}
          <Button
            variant="secondary"
            size="icon"
            onClick={goNext}
            disabled={!canNext}
            aria-label="التالي"
            className="shrink-0 rounded-full shadow-lg disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* progress */}
      <footer className="no-print pb-5 text-center text-xs text-white/50">
        صفحة {Math.min(page + perView, pages.length)} من {pages.length}
      </footer>
    </div>
  )
}
