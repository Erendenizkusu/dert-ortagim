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

// ------------------------------------------------------------
//  Raporlama sebepleri (DB check kısıtı ile birebir eşleşir)
// ------------------------------------------------------------
export type RaporSebep = {
  slug:
    | "spam"
    | "taciz"
    | "siddet"
    | "cinsel"
    | "kendine_zarar"
    | "alakasiz"
    | "diger";
  label: string;
  aciklama: string;
};

export const RAPOR_SEBEPLERI: RaporSebep[] = [
  { slug: "taciz", label: "Taciz veya nefret", aciklama: "Hakaret, aşağılama, nefret söylemi" },
  { slug: "siddet", label: "Şiddet veya tehlike", aciklama: "Tehdit, şiddete teşvik" },
  {
    slug: "kendine_zarar",
    label: "Kendine zarar / kriz",
    aciklama: "Birinin acil desteğe ihtiyacı olabilir",
  },
  { slug: "cinsel", label: "Cinsel içerik", aciklama: "Uygunsuz veya müstehcen içerik" },
  { slug: "spam", label: "Spam veya reklam", aciklama: "Alakasız tanıtım, dolandırıcılık" },
  { slug: "alakasiz", label: "Alakasız içerik", aciklama: "Platformun amacına uymuyor" },
  { slug: "diger", label: "Diğer", aciklama: "Yukarıdakilere uymayan bir durum" },
];

export const RAPOR_SEBEP_LABEL: Record<string, string> = Object.fromEntries(
  RAPOR_SEBEPLERI.map((r) => [r.slug, r.label]),
);

// ------------------------------------------------------------
//  Doğrulanmış destek/kriz hatları (Temmuz 2026)
//  Kaynak: T.C. resmi acil hatları + findahelpline.com/tr-TR
// ------------------------------------------------------------
export type DestekHatti = {
  numara: string;
  ad: string;
  aciklama: string;
  href?: string;
};

export const DESTEK_HATLARI: DestekHatti[] = [
  {
    numara: "112",
    ad: "Acil Yardım",
    aciklama:
      "Hayati tehlike, intihar girişimi veya acil tıbbi durumda hemen ara. 7/24, ücretsiz.",
  },
  {
    numara: "183",
    ad: "ALO 183 Sosyal Destek Hattı",
    aciklama:
      "Aile ve Sosyal Hizmetler Bakanlığı. Şiddet, istismar ve psikososyal destek için. 7/24, ücretsiz.",
    href: "https://www.aile.gov.tr/",
  },
];

/** Uluslararası/güncel hat listesi için güvenilir toplayıcı. */
export const DESTEK_TOPLAYICI = {
  ad: "Find a Helpline — Türkiye",
  aciklama: "Ücretsiz, gizli, 7/24 hatların güncel listesi.",
  href: "https://findahelpline.com/tr-TR",
};
