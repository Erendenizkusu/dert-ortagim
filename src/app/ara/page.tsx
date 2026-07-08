import Link from "next/link";
import { SearchX } from "lucide-react";
import { searchPosts, getMyMeTooSet, type SearchOpts } from "@/lib/queries";
import { POPULER_ETIKETLER, KATEGORILER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/search-bar";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ara" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;
const str = (v: string | string[] | undefined) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

export default async function AraPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = str(sp.q);
  const kategori = str(sp.kategori);
  const etiket = str(sp.etiket);
  const durumRaw = str(sp.durum);
  const durum =
    durumRaw === "solved" || durumRaw === "bekleyen" ? durumRaw : undefined;

  const opts: SearchOpts = { q, category: kategori, tag: etiket, durum };
  const aramaVar = Boolean(q || kategori || etiket || durum);

  const posts = aramaVar ? await searchPosts(opts) : [];
  const meTooSet = await getMyMeTooSet(posts.map((p) => p.id));

  // Filtre linkleri mevcut parametreleri korur
  const build = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, kategori, etiket, durum, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const qs = p.toString();
    return qs ? `/ara?${qs}` : "/ara";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="mb-3 text-xl font-semibold tracking-tight">Dert ara</h1>
        <SearchBar initialQuery={q ?? ""} />
      </div>

      {/* Popüler etiketler */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Popüler etiketler
        </p>
        <div className="flex flex-wrap gap-1.5">
          {POPULER_ETIKETLER.map((t) => (
            <Link
              key={t}
              href={build({ etiket: etiket === t ? undefined : t })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                etiket === t
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
              )}
            >
              #{t}
            </Link>
          ))}
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href={build({ durum: undefined })} active={!durum} label="Tümü" />
        <FilterChip
          href={build({ durum: durum === "solved" ? undefined : "solved" })}
          active={durum === "solved"}
          label="Çözülmüş"
        />
        <FilterChip
          href={build({ durum: durum === "bekleyen" ? undefined : "bekleyen" })}
          active={durum === "bekleyen"}
          label="Cevap bekleyen"
        />
        <span className="mx-1 w-px self-stretch bg-border" />
        {KATEGORILER.map((k) => (
          <FilterChip
            key={k.slug}
            href={build({ kategori: kategori === k.slug ? undefined : k.slug })}
            active={kategori === k.slug}
            label={`${k.emoji} ${k.label}`}
          />
        ))}
      </div>

      {/* Sonuçlar */}
      {!aramaVar ? (
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Bir kelime yaz ya da yukarıdan bir etiket/kategori seç.
        </p>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title="Sonuç bulunamadı"
          description="Farklı bir kelime deneyebilir veya bu konuda ilk derdi sen paylaşabilirsin."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{posts.length} sonuç</p>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} meToo={meTooSet.has(post.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
