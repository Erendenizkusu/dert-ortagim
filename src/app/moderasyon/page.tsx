import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  EyeOff,
  Eye,
  Check,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOpenReports } from "@/lib/queries";
import { RAPOR_SEBEP_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { moderate } from "./actions";

export const metadata = { title: "Moderasyon" };

export default async function ModerasyonPage() {
  const user = await getCurrentUser();
  // proxy giriş şartını sağlar; rol kontrolü burada.
  if (!user || user.profile?.role !== "moderator") notFound();

  const reports = await getOpenReports();

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">Moderasyon</h1>
          <p className="text-sm text-muted-foreground">
            {reports.length > 0
              ? `${reports.length} açık rapor`
              : "Bekleyen rapor yok"}
          </p>
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/40 py-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">Her şey yolunda görünüyor 🤍</p>
          <p className="text-xs text-muted-foreground">
            Yeni bir bildirim geldiğinde burada belirir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-card/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
                  {RAPOR_SEBEP_LABEL[r.reason] ?? r.reason}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {r.target_type === "post" ? "Gönderi" : "Tavsiye"}
                </span>
                {r.report_count > 1 && (
                  <span className="text-xs font-medium text-red-400">
                    · {r.report_count} kez bildirildi
                  </span>
                )}
                {r.is_hidden && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    <EyeOff className="h-3 w-3" /> Gizli
                  </span>
                )}
              </div>

              {r.target_type === "post" && r.title && (
                <h2 className="mt-2.5 text-sm font-semibold">{r.title}</h2>
              )}
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                {r.body}
              </p>

              {r.note && (
                <p className="mt-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Bildiren notu:</span>{" "}
                  {r.note}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={`/dert/${r.link_id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  İçeriğe git
                </Link>

                {r.is_hidden ? (
                  <form action={moderate.bind(null, r.id, "unhide")}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Görünür yap
                    </button>
                  </form>
                ) : (
                  <form action={moderate.bind(null, r.id, "hide")}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      İçeriği gizle
                    </button>
                  </form>
                )}

                <form action={moderate.bind(null, r.id, "dismiss")} className="ml-auto">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Sorun yok, yoksay
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
