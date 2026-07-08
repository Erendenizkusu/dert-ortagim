import Link from "next/link";
import { PenLine, Search, HeartHandshake, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-2 px-4">
        <Link href="/" className="mr-auto flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <HeartHandshake className="h-4.5 w-4.5" />
          </span>
          <span className="text-[15px] tracking-tight">dert ortağım</span>
        </Link>

        <Link
          href="/ara"
          aria-label="Ara"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-primary/50"
        >
          <Search className="h-4 w-4" />
        </Link>

        <ThemeToggle />

        {user ? (
          <div className="flex items-center gap-2">
            {user.profile?.role === "moderator" && (
              <Link
                href="/moderasyon"
                aria-label="Moderasyon"
                title="Moderasyon"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-primary hover:border-primary/50"
              >
                <ShieldCheck className="h-4 w-4" />
              </Link>
            )}
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/yeni">
                <PenLine className="h-4 w-4" />
                <span className="hidden sm:inline">Dert paylaş</span>
              </Link>
            </Button>
            <Link
              href="/profil"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground"
              title={user.profile?.display_name ?? "Profil"}
            >
              {(user.profile?.display_name ?? "?").charAt(0).toLocaleUpperCase("tr-TR")}
            </Link>
            <form action={signOut} className="hidden sm:block">
              <button
                type="submit"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Çıkış
              </button>
            </form>
          </div>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href="/giris">Giriş yap</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
