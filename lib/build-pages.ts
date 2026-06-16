import type { Company, SectionWithPages } from "./catalog"

export type BookPage =
  | { kind: "cover"; company: Company }
  | { kind: "intro"; company: Company }
  | { kind: "heritage"; company: Company }
  | { kind: "section-title"; section: SectionWithPages }
  | {
      kind: "image"
      section: SectionWithPages
      imageUrl: string
      caption: string
      index: number
      total: number
    }
  | { kind: "contact"; company: Company }

export function buildPages(company: Company, sections: SectionWithPages[]): BookPage[] {
  const pages: BookPage[] = []
  pages.push({ kind: "cover", company })
  if (company.intro_text?.trim()) pages.push({ kind: "intro", company })
  if (company.heritage_text?.trim()) pages.push({ kind: "heritage", company })

  for (const section of sections) {
    pages.push({ kind: "section-title", section })
    section.pages.forEach((p, i) => {
      pages.push({
        kind: "image",
        section,
        imageUrl: p.image_url,
        caption: p.caption,
        index: i + 1,
        total: section.pages.length,
      })
    })
  }

  pages.push({ kind: "contact", company })
  return pages
}

/** Build pages for a single section (used for per-section PDF) */
export function buildSectionPages(company: Company, section: SectionWithPages): BookPage[] {
  const pages: BookPage[] = [{ kind: "cover", company }, { kind: "section-title", section }]
  section.pages.forEach((p, i) => {
    pages.push({
      kind: "image",
      section,
      imageUrl: p.image_url,
      caption: p.caption,
      index: i + 1,
      total: section.pages.length,
    })
  })
  pages.push({ kind: "contact", company })
  return pages
}
