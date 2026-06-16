import Link from "next/link"
import type { Company } from "@/lib/catalog"
import { MapPin } from "lucide-react"

export function ClosedBook({ company }: { company: Company }) {
  return (
    <Link
      href="/catalog"
      aria-label="افتح الكتالوج"
      className="group relative block aspect-square w-full max-w-sm transition-transform duration-300 hover:-translate-y-1"
    >
      {/* page edges (right, since RTL spine is on the left) */}
      <div className="absolute inset-y-2 -right-1 w-2 rounded-e-sm bg-gradient-to-b from-neutral-200 to-neutral-400" />
      <div className="absolute inset-y-1 -right-0.5 w-1.5 rounded-e-sm bg-neutral-300" />

      {/* cover */}
      <div className="book-page-shadow relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg rounded-s-sm border-s-[6px] border-[#5a0f18] bg-[#2a1a17] text-center transition-shadow group-hover:shadow-2xl">
        <img src="/cover-bg.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a17]/70 via-[#2a1a17]/45 to-[#2a1a17]/90" />
        <div className="relative z-10 flex flex-col items-center gap-3 px-6">
          <div className="rounded-full bg-white/95 p-3 shadow-lg">
            <img src="/logo.png" alt={company.name_en} className="h-14 w-14 object-contain" />
          </div>
          <h2 className="text-balance font-heading text-2xl font-black text-white drop-shadow md:text-3xl">
            {company.name_ar}
          </h2>
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.28em] text-amber-200/90">
            {company.name_en}
          </p>
          <div className="h-px w-16 bg-amber-200/50" />
          <p className="text-sm text-amber-50/85">كتالوج المنتجات</p>
          <span className="mt-1 rotate-[-4deg] rounded border border-amber-300/70 px-3 py-1 font-heading text-xs font-bold text-amber-200">
            {company.warranty}
          </span>
          <p className="mt-2 flex items-center gap-1 text-xs text-amber-50/70">
            <MapPin className="h-3.5 w-3.5" /> {company.location}
          </p>
        </div>
        <span className="absolute bottom-4 z-10 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold text-white backdrop-blur transition-colors group-hover:bg-white/25">
          اضغط لفتح الكتالوج
        </span>
      </div>
    </Link>
  )
}
