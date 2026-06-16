import { query } from "./db"

export type Company = {
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

export type Section = {
  id: number
  slug: string
  title: string
  subtitle: string
  description: string
  cover_image_url: string
  position: number
}

export type Page = {
  id: number
  section_id: number
  image_url: string
  caption: string
  position: number
}

export type SectionWithPages = Section & { pages: Page[] }

export async function getCompany(): Promise<Company> {
  const rows = await query<Company>("SELECT * FROM company WHERE id = 1")
  return rows[0]
}

export async function getSections(): Promise<Section[]> {
  return query<Section>("SELECT * FROM sections ORDER BY position ASC, id ASC")
}

export async function getSectionBySlug(slug: string): Promise<Section | null> {
  const rows = await query<Section>("SELECT * FROM sections WHERE slug = $1", [slug])
  return rows[0] ?? null
}

export async function getPagesForSection(sectionId: number): Promise<Page[]> {
  return query<Page>("SELECT * FROM pages WHERE section_id = $1 ORDER BY position ASC, id ASC", [sectionId])
}

export async function getFullCatalog(): Promise<{
  company: Company
  sections: SectionWithPages[]
}> {
  const [company, sections, allPages] = await Promise.all([
    getCompany(),
    getSections(),
    query<Page>("SELECT * FROM pages ORDER BY position ASC, id ASC"),
  ])

  const sectionsWithPages: SectionWithPages[] = sections.map((s) => ({
    ...s,
    pages: allPages.filter((p) => p.section_id === s.id),
  }))

  return { company, sections: sectionsWithPages }
}
