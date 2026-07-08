"use client";

import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import type { PostPublic } from "@/lib/database.types";
import { kategoriBul } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AuthorLine } from "@/components/author-line";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/status-pill";
import { MeTooButton } from "@/components/me-too-button";
import { SensitiveGate } from "@/components/sensitive-gate";
import { TagList } from "@/components/tag-list";
import { ReportButton } from "@/components/report-button";

export function PostCard({
  post,
  meToo,
}: {
  post: PostPublic;
  meToo: boolean;
}) {
  const kategori = kategoriBul(post.category);
  const solved = post.status === "solved";

  return (
    <article
      className={cn(
        "animate-fade-in rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm transition hover:border-primary/30",
        solved && "border-solved/30 bg-solved/[0.04]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <AuthorLine
          isAnonymous={post.is_anonymous}
          displayName={post.author_display_name}
          createdAt={post.created_at}
        />
        {kategori && (
          <Badge className="shrink-0">
            {kategori.emoji} {kategori.label}
          </Badge>
        )}
      </div>

      <Link href={`/dert/${post.id}`} className="mt-3 block">
        <h2 className="text-base font-semibold leading-snug text-foreground">
          {post.title}
        </h2>
        <div className="mt-1.5">
          <SensitiveGate sensitive={post.is_sensitive}>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {post.body}
            </p>
          </SensitiveGate>
        </div>
      </Link>

      {post.tags?.length > 0 && (
        <div className="mt-3">
          <TagList tags={post.tags} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <MeTooButton
          postId={post.id}
          initialActive={meToo}
          initialCount={post.me_too_count}
        />
        <Link
          href={`/dert/${post.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <MessagesSquare className="h-4 w-4" />
          {post.advice_count > 0 ? `${post.advice_count} tavsiye` : "Tavsiye ver"}
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <StatusPill status={post.status} adviceCount={post.advice_count} />
          <ReportButton
            targetType="post"
            targetId={post.id}
            isMine={post.is_mine}
          />
        </div>
      </div>
    </article>
  );
}
