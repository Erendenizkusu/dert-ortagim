import { CheckCircle2, MessageCircleQuestion } from "lucide-react";
import type { PostStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  adviceCount,
  className,
}: {
  status: PostStatus;
  adviceCount: number;
  className?: string;
}) {
  if (status === "solved") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-solved/40 bg-solved/10 px-2.5 py-0.5 text-xs font-medium text-solved",
          className,
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Derdine derman bulundu
      </span>
    );
  }
  if (adviceCount === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
          className,
        )}
      >
        <MessageCircleQuestion className="h-3.5 w-3.5" />
        Cevap bekliyor
      </span>
    );
  }
  return null;
}
