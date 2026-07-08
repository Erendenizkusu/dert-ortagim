import Link from "next/link";
import { KATEGORILER, type Kategori } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FeedTab } from "@/lib/queries";

/** Feed üstündeki kategori filtreleri. Aktif tab'ı korur. */
export function CategoryChips({
  aktif,
  tab,
}: {
  aktif?: string;
  tab?: FeedTab;
}) {
  const href = (slug?: string) => {
    const p = new URLSearchParams();
    if (tab === "populer") p.set("tab", "populer");
    if (slug) p.set("kategori", slug);
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip href={href()} active={!aktif} label="Tümü" />
      {KATEGORILER.map((k: Kategori) => (
        <Chip
          key={k.slug}
          href={href(k.slug)}
          active={aktif === k.slug}
          label={`${k.emoji} ${k.label}`}
        />
      ))}
    </div>
  );
}

function Chip({
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
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
