import { VenetianMask } from "lucide-react";
import { zamanOnce } from "@/lib/utils";
import { ANONIM_AD } from "@/lib/constants";

export function AuthorLine({
  isAnonymous,
  displayName,
  createdAt,
}: {
  isAnonymous: boolean;
  displayName: string | null;
  createdAt: string;
}) {
  const ad = isAnonymous ? ANONIM_AD : (displayName ?? ANONIM_AD);
  const bas = ad.charAt(0).toLocaleUpperCase("tr-TR");

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
        aria-hidden
      >
        {isAnonymous ? <VenetianMask className="h-3.5 w-3.5" /> : bas}
      </span>
      <span className="font-medium text-foreground">{ad}</span>
      <span className="text-muted-foreground">· {zamanOnce(createdAt)}</span>
    </div>
  );
}
