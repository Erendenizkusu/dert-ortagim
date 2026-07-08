"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import type { AdvicePublic } from "@/lib/database.types";
import { markSolution } from "@/app/dert/[id]/actions";
import { cn } from "@/lib/utils";
import { AuthorLine } from "@/components/author-line";
import { ReportButton } from "@/components/report-button";

export function AdviceCard({
  advice,
  isPostOwner,
}: {
  advice: AdvicePublic;
  isPostOwner: boolean;
}) {
  const helpful = advice.is_helpful;

  return (
    <div
      className={cn(
        "animate-fade-in rounded-2xl border p-4",
        helpful
          ? "border-solved/40 bg-solved/[0.06]"
          : "border-border bg-card/50",
      )}
    >
      {helpful && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-solved/15 px-2.5 py-0.5 text-xs font-semibold text-solved">
          <Sparkles className="h-3.5 w-3.5" />
          Derdine derman oldu
        </div>
      )}

      <AuthorLine
        isAnonymous={advice.is_anonymous}
        displayName={advice.author_display_name}
        createdAt={advice.created_at}
      />

      <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {advice.body}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {isPostOwner && (
          <form action={markSolution.bind(null, advice.post_id, advice.id)}>
            <button
              type="submit"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                helpful
                  ? "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                  : "border-solved/40 bg-solved/10 text-solved hover:bg-solved/20",
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {helpful ? "Çözümü geri al" : "Derdime derman oldu"}
            </button>
          </form>
        )}
        <ReportButton
          targetType="advice"
          targetId={advice.id}
          isMine={advice.is_mine}
          className="ml-auto"
        />
      </div>
    </div>
  );
}
