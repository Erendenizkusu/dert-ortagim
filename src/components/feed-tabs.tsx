import Link from "next/link";
import { Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedTab } from "@/lib/queries";

export function FeedTabs({
  tab,
  kategori,
}: {
  tab: FeedTab;
  kategori?: string;
}) {
  const href = (t: FeedTab) => {
    const p = new URLSearchParams();
    if (t === "populer") p.set("tab", "populer");
    if (kategori) p.set("kategori", kategori);
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className="inline-flex rounded-full border border-border bg-card/40 p-1 text-sm">
      <Tab href={href("yeni")} active={tab === "yeni"} icon={<Clock className="h-4 w-4" />}>
        En Yeniler
      </Tab>
      <Tab
        href={href("populer")}
        active={tab === "populer"}
        icon={<Flame className="h-4 w-4" />}
      >
        Ben de Yaşıyorum
      </Tab>
    </div>
  );
}

function Tab({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
