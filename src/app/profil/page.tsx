import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartHandshake, Sparkles, Inbox, Pencil, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProfileData, getMyMeTooSet } from "@/lib/queries";
import { signOut } from "@/lib/auth-actions";
import { zamanOnce, cn } from "@/lib/utils";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profilim" };

type SP = Promise<{ sekme?: string }>;

export default async function ProfilPage({ searchParams }: { searchParams: SP }) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/profil");

  const { sekme } = await searchParams;
  const aktifSekme = sekme === "tavsiyeler" ? "tavsiyeler" : "dertler";

  const { posts, advices } = await getProfileData(user.id);
  const meTooSet = await getMyMeTooSet(posts.map((p) => p.id));

  const helpedCount = advices.filter((a) => a.is_helpful).length;
  const ad = user.profile?.display_name ?? "Sen";

  return (
    <div className="space-y-5">
      {/* Başlık kartı */}
      <section className="animate-fade-in rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary">
            {ad.charAt(0).toLocaleUpperCase("tr-TR")}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{ad}</h1>
            {user.profile?.username && (
              <Link
                href={`/u/${user.profile.username}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
              >
                @{user.profile.username}
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <Link
              href="/profil/duzenle"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Düzenle
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Çıkış yap
              </button>
            </form>
          </div>
        </div>

        {user.profile?.bio && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {user.profile.bio}
          </p>
        )}

        {/* "Kaç kişiye dert ortağı oldun?" */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat value={posts.length} label="dert" />
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
            {helpedCount} kişiye dert ortağı oldun. Ne güzel. 🤍
          </div>
        )}
      </section>

      {/* Sekmeler */}
      <div className="inline-flex rounded-full border border-border bg-card/40 p-1 text-sm">
        <SekmeTab href="/profil" active={aktifSekme === "dertler"} label={`Dertlerim (${posts.length})`} />
        <SekmeTab
          href="/profil?sekme=tavsiyeler"
          active={aktifSekme === "tavsiyeler"}
          label={`Tavsiyelerim (${advices.length})`}
        />
      </div>

      {aktifSekme === "dertler" ? (
        posts.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8" />}
            title="Henüz dert paylaşmadın"
            description="İçini dökmek istediğinde buradan paylaşabilirsin."
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} meToo={meTooSet.has(post.id)} />
            ))}
          </div>
        )
      ) : advices.length === 0 ? (
        <EmptyState
          title="Henüz tavsiye vermedin"
          description="Birinin derdine ortak olmak için akışa göz at."
        />
      ) : (
        <div className="space-y-3">
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
                {a.is_anonymous && <Badge>Anonim</Badge>}
                <span>{zamanOnce(a.created_at)}</span>
              </div>
              <p className="line-clamp-3 text-sm text-foreground/90">{a.body}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
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

function SekmeTab({
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
        "rounded-full px-3.5 py-1.5 font-medium transition",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
