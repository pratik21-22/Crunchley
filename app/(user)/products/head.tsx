import { absoluteUrl, canonicalUrl } from "@/lib/seo"

export default function Head(): React.ReactNode {
  return (
    <>
      <title>Shop All Flavours | Crunchley</title>
      <meta
        name="description"
        content="Browse Crunchley&apos;s roasted makhana flavours, compare prices, and shop healthy snacks online in India."
      />
      <link rel="canonical" href={canonicalUrl("/products")} />
      <meta property="og:title" content="Shop All Flavours | Crunchley" />
      <meta
        property="og:description"
        content="Browse Crunchley&apos;s roasted makhana flavours, compare prices, and shop healthy snacks online in India."
      />
      <meta property="og:url" content={absoluteUrl("/products")} />
    </>
  )
}
