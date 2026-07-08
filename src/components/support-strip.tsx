import Link from "next/link";
import { LifeBuoy, Phone } from "lucide-react";
import { DESTEK_HATLARI } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Nazik kriz/destek şeridi. Hassas içerik ve dert paylaşma akışında gösterilir.
 * Tam liste için /destek sayfasına yönlendirir.
 */
export function SupportStrip({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-sensitive/30 bg-sensitive/[0.06] p-4",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sensitive/15 text-sensitive">
          <LifeBuoy className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Zorlanıyorsan yalnız değilsin.
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Acil bir durumdaysan ya da birine ihtiyacın varsa, uzman destek bir telefon
            kadar yakın:
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {DESTEK_HATLARI.map((h) => (
              <a
                key={h.numara}
                href={`tel:${h.numara}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-foreground transition hover:border-sensitive/50"
                title={h.ad}
              >
                <Phone className="h-3.5 w-3.5 text-sensitive" />
                {h.numara}
                <span className="text-muted-foreground">· {h.ad}</span>
              </a>
            ))}
          </div>

          <Link
            href="/destek"
            className="mt-2.5 inline-block text-xs font-medium text-primary hover:underline"
          >
            Tüm destek kaynakları →
          </Link>
        </div>
      </div>
    </aside>
  );
}
