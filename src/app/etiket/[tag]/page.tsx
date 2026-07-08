import Link from "next/link";
import { ArrowLeft, Hash } from "lucide-react";
import { searchPosts, getMyMeTooSet } from "@/lib/queries";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

type Params = Promise<{ tag: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)}` };
}

export default async function EtiketPage({ params }: { params: Params }) {
  const { tag } = await params;
  const etiket = decodeURIComponent(tag);
  const posts = await searchPosts({ tag: etiket });
  const meTooSet = await getMyMeTooSet(posts.map((p) => p.id));

  return (
    <div className="space-y-5">
      <Link
        href="/ara"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Aramaya dön
      </Link>

      <h1 className="flex items-center gap-1.5 text-xl font-semibold tracking-tight">
        <Hash className="h-5 w-5 text-primary" />
        {etiket}
      </h1>

      {posts.length === 0 ? (
        <EmptyState
          title="Bu etikette dert yok"
          description="Bu etiketle ilk paylaşımı sen yapabilirsin."
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
