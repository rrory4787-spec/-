import Link from "next/link"
import type { SectionWithPages } from "@/lib/catalog"
import { ArrowLeft } from "lucide-react"

export function SectionGrid({ sections }: { sections: SectionWithPages[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
      {sections.map((section) => {
        const cover = section.cover_image_url || section.pages[0]?.image_url || ""
        return (
          <Link
            key={section.id}
            href={`/catalog?section=${section.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
              {cover ? (
                <img
                  src={cover || "/placeholder.svg"}
                  alt={section.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-heading text-2xl font-black text-muted-foreground/30">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="flex flex-1 flex-col p-3 md:p-4">
              <h3 className="font-heading text-base font-bold text-foreground md:text-lg">
                {section.title}
              </h3>
              <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {section.subtitle || section.description}
              </p>
              <span className="mt-3 flex items-center gap-1 text-xs font-bold text-primary">
                تصفّح القسم
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
