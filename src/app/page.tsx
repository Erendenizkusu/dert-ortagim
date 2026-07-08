import Link from "next/link";
import { Inbox, PenLine } from "lucide-react";
import { getFeed, getMyMeTooSet, type FeedTab } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { FeedTabs } from "@/components/feed-tabs";
import { CategoryChips } from "@/components/category-chips";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const tab: FeedTab = sp.tab === "populer" ? "populer" : "yeni";
  const kategori = typeof sp.kategori === "string" ? sp.kategori : undefined;

  const [posts, user] = await Promise.all([
    getFeed({ tab, category: kategori }),
    getCurrentUser(),
  ]);
  const meTooSet = await getMyMeTooSet(posts.map((p) => p.id));

  return (
    <div className="space-y-5">
      {!user && (
        <section className="animate-fade-in rounded-2xl border border-primary/20 bg-primary/[0.06] p-5">
          <h1 className="text-lg font-semibold tracking-tight">
            Yalnız değilsin. 🤍
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Derdini paylaş, aynı yolu yürümüş insanlardan tavsiye al. İstersen
            tamamen anonim.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild size="sm">
              <Link href="/kayit">Hemen başla</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/giris">Giriş yap</Link>
            </Button>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <FeedTabs tab={tab} kategori={kategori} />
        {user && (
          <Button asChild size="sm" variant="ghost" className="gap-1.5">
            <Link href="/yeni">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Dert paylaş</span>
            </Link>
          </Button>
        )}
      </div>

      <CategoryChips aktif={kategori} tab={tab} />

      {posts.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title="Burada henüz bir dert yok"
          description={
            kategori
              ? "Bu kategoride ilk paylaşımı sen yapabilirsin."
              : "İlk derdini paylaşan sen ol; belki birinin içini rahatlatırsın."
          }
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} meToo={meTooSet.has(post.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
