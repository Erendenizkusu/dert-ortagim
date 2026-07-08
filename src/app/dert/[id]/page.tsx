import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, MessagesSquare } from "lucide-react";
import { getPost, getAdvices, getMyMeTooSet } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { kategoriBul } from "@/lib/constants";
import { AuthorLine } from "@/components/author-line";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/status-pill";
import { MeTooButton } from "@/components/me-too-button";
import { SensitiveGate } from "@/components/sensitive-gate";
import { TagList } from "@/components/tag-list";
import { AdviceCard } from "@/components/advice-card";
import { AdviceForm } from "@/components/advice-form";
import { EmptyState } from "@/components/empty-state";
import { ReportButton } from "@/components/report-button";
import { SupportStrip } from "@/components/support-strip";
import { deletePost } from "./actions";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPost(id);
  return { title: post ? post.title : "Dert" };
}

export default async function DertPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const [advices, user, meTooSet] = await Promise.all([
    getAdvices(id),
    getCurrentUser(),
    getMyMeTooSet([id]),
  ]);

  const kategori = kategoriBul(post.category);

  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Akışa dön
      </Link>

      {/* Dert kutusu */}
      <article className="animate-fade-in rounded-2xl border border-border bg-card/70 p-5">
        <div className="flex items-start justify-between gap-2">
          <AuthorLine
            isAnonymous={post.is_anonymous}
            displayName={post.author_display_name}
            createdAt={post.created_at}
          />
          <div className="flex shrink-0 items-center gap-2">
            {kategori && (
              <Badge>
                {kategori.emoji} {kategori.label}
              </Badge>
            )}
            {post.is_mine ? (
              <form action={deletePost.bind(null, post.id)}>
                <button
                  type="submit"
                  aria-label="Derdi sil"
                  className="text-muted-foreground transition hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <ReportButton targetType="post" targetId={post.id} />
            )}
          </div>
        </div>

        <h1 className="mt-3 text-xl font-semibold leading-snug">{post.title}</h1>

        <div className="mt-3">
          <SensitiveGate sensitive={post.is_sensitive}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {post.body}
            </p>
          </SensitiveGate>
        </div>

        {post.is_sensitive && <SupportStrip className="mt-4" />}

        {post.tags?.length > 0 && (
          <div className="mt-4">
            <TagList tags={post.tags} />
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <MeTooButton
            postId={post.id}
            initialActive={meTooSet.has(post.id)}
            initialCount={post.me_too_count}
          />
          <StatusPill
            status={post.status}
            adviceCount={post.advice_count}
            className="ml-auto"
          />
        </div>
      </article>

      {/* Tavsiyeler */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <MessagesSquare className="h-4 w-4" />
          {post.advice_count > 0
            ? `${post.advice_count} tavsiye`
            : "Henüz tavsiye yok"}
        </h2>

        {user ? (
          <AdviceForm postId={post.id} />
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
            Tavsiye vermek için{" "}
            <Link href={`/giris?next=/dert/${post.id}`} className="font-medium text-primary hover:underline">
              giriş yap
            </Link>
            .
          </div>
        )}

        {advices.length === 0 ? (
          <EmptyState
            title="İlk tavsiyeyi sen ver"
            description="Belki senin bir cümlen, birinin gününü değiştirir."
          />
        ) : (
          <div className="space-y-3">
            {advices.map((a) => (
              <AdviceCard key={a.id} advice={a} isPostOwner={post.is_mine} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
