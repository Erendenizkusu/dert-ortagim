export type Kategori = {
  slug: string;
  label: string;
  emoji: string;
};

/** Sabit kategori listesi — DB'de posts.category slug olarak tutulur. */
export const KATEGORILER: Kategori[] = [
  { slug: "gundelik", label: "Gündelik", emoji: "🌤️" },
  { slug: "iliskiler", label: "İlişkiler", emoji: "💞" },
  { slug: "is-kariyer", label: "İş / Kariyer", emoji: "💼" },
  { slug: "psikoloji", label: "Psikoloji", emoji: "🧠" },
  { slug: "saglik", label: "Sağlık", emoji: "🩺" },
  { slug: "aile", label: "Aile", emoji: "🏠" },
  { slug: "okul", label: "Okul / Üniversite", emoji: "🎓" },
];

export const KATEGORI_MAP: Record<string, Kategori> = Object.fromEntries(
  KATEGORILER.map((k) => [k.slug, k]),
);

export function kategoriBul(slug: string | null | undefined): Kategori | undefined {
  if (!slug) return undefined;
  return KATEGORI_MAP[slug];
}

/** Arama sayfasında gösterilecek örnek popüler etiketler. */
export const POPULER_ETIKETLER = [
  "anksiyete",
  "yalnizlik",
  "universite",
  "uykusuzluk",
  "ayrilik",
  "motivasyon",
  "is-stresi",
  "ozguven",
];

export const ANONIM_AD = "Anonim";
