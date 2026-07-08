"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function MeTooButton({
  postId,
  initialActive,
  initialCount,
}: {
  postId: string;
  initialActive: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  async function toggle() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/giris");
      return;
    }

    const next = !active;
    // optimistik
    setActive(next);
    setCount((c) => c + (next ? 1 : -1));

    const { error } = next
      ? await supabase.from("me_too").insert({ post_id: postId, user_id: user.id })
      : await supabase
          .from("me_too")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

    if (error) {
      // geri al
      setActive(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(toggle)}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
        active
          ? "border-metoo/40 bg-metoo/10 text-metoo"
          : "border-border bg-card/40 text-muted-foreground hover:text-foreground hover:border-metoo/40",
      )}
    >
      <HeartHandshake className="h-4 w-4" />
      <span>Ben de yaşıyorum</span>
      {count > 0 && <span className="tabular-nums">· {count}</span>}
    </button>
  );
}
