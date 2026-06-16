import type { BookPage } from "@/lib/build-pages"
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react"

export function BookLeaf({ page }: { page: BookPage }) {
  switch (page.kind) {
    case "cover":
      return <CoverLeaf company={page.company} />
    case "intro":
      return <IntroLeaf company={page.company} />
    case "heritage":
      return <HeritageLeaf company={page.company} />
    case "section-title":
      return <SectionTitleLeaf section={page.section} />
    case "image":
      return (
        <ImageLeaf
          imageUrl={page.imageUrl}
          caption={page.caption}
          sectionTitle={page.section.title}
          index={page.index}
          total={page.total}
        />
      )
    case "contact":
      return <ContactLeaf company={page.company} />
  }
}

function CoverLeaf({ company }: { company: BookPage extends { company: infer C } ? C : any }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#2a1a17] text-center">
      <img
        src="/cover-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a17]/70 via-[#2a1a17]/40 to-[#2a1a17]/90" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6">
        <div className="rounded-full bg-white/95 p-4 shadow-xl">
          <img src="/logo.png" alt={company.name_en} className="h-16 w-16 object-contain" />
        </div>
        <h1 className="text-balance font-heading text-3xl font-black text-white drop-shadow md:text-4xl">
          {company.name_ar}
        </h1>
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-amber-200/90">
          {company.name_en}
        </p>
        <div className="my-2 h-px w-24 bg-amber-200/50" />
        <p className="text-pretty text-base text-amber-50/90 md:text-lg">{company.tagline}</p>
        <span className="mt-3 inline-block rotate-[-4deg] rounded border-2 border-amber-300/80 px-4 py-1.5 font-heading text-sm font-bold text-amber-200">
          {company.warranty}
        </span>
        <p className="mt-4 flex items-center gap-1.5 text-sm text-amber-50/70">
          <MapPin className="h-4 w-4" /> {company.location}
        </p>
      </div>
    </div>
  )
}

function IntroLeaf({ company }: { company: any }) {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-card px-7 py-8 md:px-12">
      <div className="mx-auto w-full max-w-md">
        <img src="/logo.png" alt="" className="mb-6 h-10 w-10 object-contain" />
        <h2 className="mb-5 font-heading text-2xl font-bold text-primary md:text-3xl">
          {company.intro_title}
        </h2>
        <p className="whitespace-pre-line text-pretty leading-relaxed text-foreground/85">
          {company.intro_text}
        </p>
      </div>
    </div>
  )
}

function HeritageLeaf({ company }: { company: any }) {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#1f2a6b] px-7 py-8 text-white md:px-12">
      <div className="mx-auto w-full max-w-md">
        <h2 className="mb-5 font-heading text-2xl font-bold text-amber-200 md:text-3xl">
          {company.tagline}
        </h2>
        <p className="whitespace-pre-line text-pretty leading-relaxed text-white/85">
          {company.heritage_text}
        </p>
      </div>
    </div>
  )
}

function SectionTitleLeaf({ section }: { section: any }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-card">
      <div className="relative flex-1">
        {section.cover_image_url ? (
          <img
            src={section.cover_image_url || "/placeholder.svg"}
            alt={section.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <span className="font-heading text-5xl font-black text-muted-foreground/40">
              {section.title}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
        <span className="mb-2 inline-block rounded bg-primary px-3 py-1 font-heading text-xs font-bold tracking-wide">
          {section.subtitle}
        </span>
        <h2 className="text-balance font-heading text-3xl font-black drop-shadow md:text-4xl">
          {section.title}
        </h2>
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-white/85">
          {section.description}
        </p>
      </div>
    </div>
  )
}

function ImageLeaf({
  imageUrl,
  caption,
  sectionTitle,
  index,
  total,
}: {
  imageUrl: string
  caption: string
  sectionTitle: string
  index: number
  total: number
}) {
  return (
    <div className="relative flex h-full w-full flex-col bg-[#15110f]">
      <div className="flex items-center justify-between px-5 pt-4 text-xs text-white/60">
        <span className="font-heading font-bold">{sectionTitle}</span>
        <span>
          {index} / {total}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={caption || sectionTitle}
            className="max-h-full max-w-full rounded object-contain shadow-lg"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-white/20 text-white/40">
            لا توجد صورة
          </div>
        )}
      </div>
      {caption ? (
        <div className="px-5 pb-5">
          <p className="text-pretty text-center text-sm text-white/80">{caption}</p>
        </div>
      ) : (
        <div className="pb-5" />
      )}
    </div>
  )
}

function ContactLeaf({ company }: { company: any }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-primary px-7 py-8 text-center text-primary-foreground">
      <div className="rounded-full bg-white/95 p-3">
        <img src="/logo.png" alt="" className="h-12 w-12 object-contain" />
      </div>
      <h2 className="font-heading text-2xl font-black md:text-3xl">{company.name_ar}</h2>
      <p className="text-sm uppercase tracking-[0.25em] text-primary-foreground/80">
        {company.name_en}
      </p>
      <div className="my-1 h-px w-20 bg-primary-foreground/40" />
      <div className="flex flex-col items-center gap-2.5 text-sm">
        <span className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> {company.phone1}
        </span>
        <span className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> {company.phone2} · {company.phone3}
        </span>
        <span className="flex items-center gap-2">
          <Mail className="h-4 w-4" /> {company.email}
        </span>
        <span className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> واتساب الصيانة: {company.whatsapp}
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {company.po_box}
        </span>
      </div>
    </div>
  )
}
