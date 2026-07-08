import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 text-center">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <Link href="/kurallar" className="transition hover:text-foreground">
            Topluluk kuralları
          </Link>
          <span aria-hidden className="text-border">·</span>
          <Link href="/destek" className="transition hover:text-foreground">
            Destek hatları
          </Link>
          <span aria-hidden className="text-border">·</span>
          <Link href="/ara" className="transition hover:text-foreground">
            Ara
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground/70">
          Burada yalnız değilsin. 🤍
        </p>
      </div>
    </footer>
  );
}
