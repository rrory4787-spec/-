import { getFullCatalog } from "@/lib/catalog"
import { FlipBook } from "@/components/flip-book"

export const dynamic = "force-dynamic"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const { section } = await searchParams
  const { company, sections } = await getFullCatalog()

  return <FlipBook company={company} sections={sections} initialSlug={section} />
}
