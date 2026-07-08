"use client";

import { useActionState, useEffect, useState } from "react";
import { VenetianMask } from "lucide-react";
import { createAdvice, type AdviceState } from "@/app/dert/[id]/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SwitchField } from "@/components/ui/switch-field";

const initial: AdviceState = { error: null };

export function AdviceForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(createAdvice, initial);
  const [body, setBody] = useState("");

  useEffect(() => {
    if (state.ok) setBody("");
  }, [state.ok]);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-border bg-card/40 p-4">
      <input type="hidden" name="post_id" value={postId} />
      <p className="text-sm font-medium">Sen ne yapardın? Tavsiyeni bırak 🤍</p>
      <Textarea
        name="body"
        required
        rows={4}
        maxLength={4000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Aynı durumu yaşadıysan nasıl atlattığını anlat…"
      />
      <SwitchField
        name="is_anonymous"
        label="Anonim yanıtla"
        defaultChecked
        icon={<VenetianMask className="h-4.5 w-4.5" />}
      />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Gönderiliyor…" : "Tavsiye ver"}
        </Button>
      </div>
    </form>
  );
}
