import Link from "next/link";
import { ArrowLeft, Phone, ExternalLink, HeartHandshake } from "lucide-react";
import { DESTEK_HATLARI, DESTEK_TOPLAYICI } from "@/lib/constants";

export const metadata = { title: "Destek hatları" };

export default function DestekPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Akışa dön
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold">Yalnız değilsin</h1>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Bazen dert paylaşmak iyi gelir, ama bazen daha fazlası gerekir. Aşağıdaki hatlar
          ücretsiz, gizli ve alanında uzman kişilerce yürütülür. Utanılacak hiçbir yanı
          yok — aramak cesarettir.
        </p>
      </header>

      <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-4">
        <p className="text-sm leading-relaxed">
          <strong className="font-semibold">Hayati tehlike varsa</strong> — kendine ya da
          bir başkasına zarar verme riski — lütfen vakit kaybetmeden{" "}
          <a href="tel:112" className="font-semibold text-red-400 hover:underline">
            112 Acil
          </a>{" "}
          ara.
        </p>
      </div>

      <section className="space-y-3">
        {DESTEK_HATLARI.map((h) => (
          <div
            key={h.numara}
            className="rounded-2xl border border-border bg-card/60 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{h.ad}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {h.aciklama}
                </p>
                {h.href && (
                  <a
                    href={h.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Resmî site <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <a
                href={`tel:${h.numara}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Phone className="h-4 w-4" />
                {h.numara}
              </a>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card/40 p-4">
        <h2 className="text-sm font-semibold">{DESTEK_TOPLAYICI.ad}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {DESTEK_TOPLAYICI.aciklama} Bulunduğun yere ve durumuna göre daha fazla hat
          burada listelenir.
        </p>
        <a
          href={DESTEK_TOPLAYICI.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          findahelpline.com/tr-TR <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Bu liste bilgilendirme amaçlıdır; tıbbi tavsiye yerine geçmez.
      </p>
    </div>
  );
}
