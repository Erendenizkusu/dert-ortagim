"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** TW/hassas içeriği buzlu gösterir; tıklayınca açar. */
export function SensitiveGate({
  sensitive,
  children,
}: {
  sensitive: boolean;
  children: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!sensitive || revealed) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="tw-blur" aria-hidden>
        {children}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setRevealed(true);
        }}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 text-center",
        )}
      >
        <span className="flex items-center gap-1.5 rounded-full border border-sensitive/40 bg-sensitive/10 px-3 py-1 text-xs font-medium text-sensitive">
          <EyeOff className="h-3.5 w-3.5" />
          Hassas içerik
        </span>
        <span className="text-xs text-muted-foreground">
          Görmek için dokun
        </span>
      </button>
    </div>
  );
}
