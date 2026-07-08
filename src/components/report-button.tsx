"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, X, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RAPOR_SEBEPLERI } from "@/lib/constants";
import type { ReportTargetType, ReportReason } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/** İçeriği moderatöre bildirme. Kendi içeriğinde gösterilmez (isMine). */
export function ReportButton({
  targetType,
  targetId,
  isMine = false,
  className,
}: {
  targetType: ReportTargetType;
  targetId: string;
  isMine?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (isMine) return null;

  async function openDialog() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/giris");
      return;
    }
    setOpen(true);
  }

  function submit() {
    if (!reason) {
      setError("Bir sebep seç.");
      return;
    }
    setError(null);
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("submit_report", {
        p_target_type: targetType,
        p_target_id: targetId,
        p_reason: reason,
        p_note: note.trim() || null,
      });
      if (error) {
        setError("Bildirim gönderilemedi. Tekrar dene.");
        return;
      }
      setDone(true);
    });
  }

  function close() {
    setOpen(false);
    // kısa gecikmeyle sıfırla ki kapanış animasyonu takılmasın
    setReason(null);
    setNote("");
    setError(null);
    setDone(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Bildir"
        title="Bildir"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-xs text-muted-foreground/70 transition hover:border-border hover:text-foreground",
          className,
        )}
      >
        <Flag className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only">Bildir</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-solved/15 text-solved">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <p className="text-sm font-medium">Bildirimin bize ulaştı 🤍</p>
                <p className="text-xs text-muted-foreground">
                  Moderasyon ekibi en kısa sürede inceleyecek. Bu alanı birlikte güvende
                  tutuyoruz.
                </p>
                <Button size="sm" variant="secondary" onClick={close} className="mt-1">
                  Kapat
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">İçeriği bildir</h2>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Kapat"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {RAPOR_SEBEPLERI.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => setReason(s.slug)}
                      className={cn(
                        "flex w-full flex-col items-start rounded-xl border px-3 py-2 text-left transition",
                        reason === s.slug
                          ? "border-primary/60 bg-primary/10"
                          : "border-border bg-card/40 hover:border-primary/30",
                      )}
                    >
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.aciklama}</span>
                    </button>
                  ))}
                </div>

                <Textarea
                  className="mt-3"
                  rows={2}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="İstersen kısaca ekle (opsiyonel)…"
                />

                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={close} disabled={pending}>
                    Vazgeç
                  </Button>
                  <Button size="sm" onClick={submit} disabled={pending}>
                    {pending ? "Gönderiliyor…" : "Bildir"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
