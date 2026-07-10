import Link from "next/link";
import { notFound } from "next/navigation";
import { HeartHandshake, Sparkles, Inbox } from "lucide-react";
import { getPublicProfile, getMyMeTooSet } from "@/lib/queries";
import type { PostPublic } from "@/lib/database.types";
import { zamanOnce, cn } from "@/lib/utils";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "Profil bulunamadı" };
  return {
    title: data.profile.display_name,
    description: data.profile.bio ?? `@${data.profile.username} · dertdaş`,
  };
}

export default async function KullaniciProfilPage({
  params,
}: {
  params: Params;
}) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  const { profile, posts, advices } = data;
  const helpedCount = advices.filter((a) => a.is_helpful).length;
  const ad = profile.display_name;

  return (
    <div className="space-y-5">
      <section className="animate-fade-in rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary">
            {ad.charAt(0).toLocaleUpperCase("tr-TR")}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{ad}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {profile.bio}
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat value={posts.length} label="paylaşılan dert" />
          <Stat value={advices.length} label="tavsiye" />
          <Stat
            value={helpedCount}
            label="derde derman"
            highlight
            icon={<HeartHandshake className="h-4 w-4" />}
          />
        </div>

        {helpedCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-solved/10 px-3 py-2 text-sm text-solved">
            <Sparkles className="h-4 w-4" />
            {helpedCount} kişiye dert ortağı oldu. 🤍
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Yalnızca anonim olmayan paylaşımlar burada görünür.
        </p>
      </section>

      {posts.length > 0 && <PostList posts={posts} />}

      {advices.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Verdiği tavsiyeler
          </h2>
          {advices.map((a) => (
            <Link
              key={a.id}
              href={`/dert/${a.post_id}`}
              className={cn(
                "block rounded-2xl border p-4 transition hover:border-primary/30",
                a.is_helpful
                  ? "border-solved/40 bg-solved/[0.06]"
                  : "border-border bg-card/50",
              )}
            >
              <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                {a.is_helpful && (
                  <Badge className="border-solved/40 bg-solved/15 text-solved">
                    <Sparkles className="h-3 w-3" /> Derman oldu
                  </Badge>
                )}
                <span>{zamanOnce(a.created_at)}</span>
              </div>
              <p className="line-clamp-3 text-sm text-foreground/90">{a.body}</p>
            </Link>
          ))}
        </section>
      )}

      {posts.length === 0 && advices.length === 0 && (
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title="Henüz herkese açık paylaşım yok"
          description="Bu kişinin anonim olmayan bir dert veya tavsiyesi bulunmuyor."
        />
      )}
    </div>
  );
}

/** Sunucu bileşeni: me_too setini alıp kartları basar. */
async function PostList({ posts }: { posts: PostPublic[] }) {
  const meTooSet = await getMyMeTooSet(posts.map((p) => p.id));
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Paylaştığı dertler
      </h2>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} meToo={meTooSet.has(post.id)} />
      ))}
    </section>
  );
}

function Stat({
  value,
  label,
  highlight,
  icon,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border p-3 text-center",
        highlight
          ? "border-metoo/30 bg-metoo/[0.07]"
          : "border-border bg-card/40",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1 text-xl font-semibold tabular-nums",
          highlight ? "text-metoo" : "text-foreground",
        )}
      >
        {icon}
        {value}
      </span>
      <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
