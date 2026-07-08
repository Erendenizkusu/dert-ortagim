"use client";

import { useActionState } from "react";
import { VenetianMask, ShieldAlert } from "lucide-react";
import { createPost, type FormState } from "@/app/yeni/actions";
import { KATEGORILER } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SwitchField } from "@/components/ui/switch-field";

const initial: FormState = { error: null };

export function NewPostForm() {
  const [state, formAction, pending] = useActionState(createPost, initial);

  return (
    <form action={formAction} className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Derdini paylaş</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          İçini dök. Birileri aynı yoldan geçmiş olabilir.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Başlık
        </label>
        <Input
          id="title"
          name="title"
          required
          maxLength={160}
          placeholder="Derdini bir cümleyle özetle"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-sm font-medium">
          Ne yaşıyorsun?
        </label>
        <Textarea
          id="body"
          name="body"
          required
          maxLength={8000}
          rows={7}
          placeholder="Detaylıca anlatabilirsin. Ne kadar açık olursan, o kadar iyi tavsiye alırsın."
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-medium">
            Kategori
          </label>
          <select
            id="category"
            name="category"
            defaultValue=""
            className="h-10 w-full rounded-xl border border-input bg-card/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="">Seçilmedi</option>
            {KATEGORILER.map((k) => (
              <option key={k.slug} value={k.slug}>
                {k.emoji} {k.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tags" className="text-sm font-medium">
            Etiketler
          </label>
          <Input
            id="tags"
            name="tags"
            placeholder="anksiyete, yalnizlik"
          />
          <p className="text-xs text-muted-foreground">Virgülle ayır, en fazla 5.</p>
        </div>
      </div>

      <div className="space-y-2">
        <SwitchField
          name="is_anonymous"
          label="Anonim paylaş"
          description="Kullanıcı adın gizli kalır, kimse kim olduğunu görmez."
          defaultChecked
          icon={<VenetianMask className="h-4.5 w-4.5" />}
        />
        <SwitchField
          name="is_sensitive"
          label="Hassas içerik (TW)"
          description="Ağır/tetikleyici konu. Akışta buzlu görünür, isteyen açar."
          icon={<ShieldAlert className="h-4.5 w-4.5" />}
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Paylaşılıyor…" : "Paylaş"}
        </Button>
      </div>
    </form>
  );
}
