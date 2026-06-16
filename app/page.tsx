import Link from "next/link"
import { getFullCatalog } from "@/lib/catalog"
import { ClosedBook } from "@/components/closed-book"
import { SectionGrid } from "@/components/section-grid"
import { Button } from "@/components/ui/button"
import { ShareMenu } from "@/components/share-menu"
import { BookOpen, Download, Phone, Mail, MessageCircle, MapPin, Settings } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { company, sections } = await getFullCatalog()

  return (
    <main className="min-h-dvh bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt={company.name_en} className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold text-foreground md:text-base">{company.name_ar}</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              {company.name_en}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ShareMenu />
          <Button asChild variant="ghost" size="icon" aria-label="لوحة التحكم">
            <Link href="/admin">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-10 md:flex-row md:gap-12 md:py-16">
        <div className="flex w-full justify-center md:w-1/2">
          <ClosedBook company={company} />
        </div>
        <div className="flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:text-right">
          <span className="mb-3 inline-block rounded-full bg-accent/20 px-4 py-1 font-heading text-xs font-bold text-accent-foreground">
            {company.tagline}
          </span>
          <h1 className="text-balance font-heading text-3xl font-black leading-tight text-foreground md:text-4xl">
            كتالوج منتجات المطبخ الأمريكي
          </h1>
          <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            تصفّح مجموعتنا الكاملة من المطابخ، خزائن الحائط، الأبواب، وحدات التلفزيون وأكثر — على شكل
            كتاب أنيق يمكنك تصفّحه وتحميله كملف PDF ومشاركته.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Button asChild size="lg" className="gap-2">
              <Link href="/catalog">
                <BookOpen className="h-5 w-5" />
                افتح الكتالوج
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
              <a href="/print" target="_blank" rel="noopener noreferrer">
                <Download className="h-5 w-5" />
                تحميل PDF
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-heading text-2xl font-bold text-foreground">الأقسام</h2>
          <span className="text-sm text-muted-foreground">{sections.length} أقسام</span>
        </div>
        <SectionGrid sections={sections} />
      </section>

      {/* Contact footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-white/95 p-1.5">
                <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
              </div>
              <span className="font-heading text-lg font-bold">{company.name_ar}</span>
            </div>
            <p className="text-sm text-primary-foreground/80">{company.tagline}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {company.phone1}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {company.phone2}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {company.phone3}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {company.email}
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> واتساب: {company.whatsapp}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {company.po_box}
            </p>
          </div>
        </div>
        <div className="border-t border-white/15 py-4 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} {company.name_en}. جميع الحقوق محفوظة.
        </div>
      </footer>
    </main>
  )
}
