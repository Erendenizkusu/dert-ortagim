"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AdviceState {
  error: string | null;
  ok?: boolean;
}

export async function createAdvice(
  _prev: AdviceState,
  formData: FormData,
): Promise<AdviceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Önce giriş yapmalısın." };

  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const isAnonymous = formData.get("is_anonymous") === "on";

  if (!postId) return { error: "Geçersiz gönderi." };
  if (body.length < 1) return { error: "Tavsiyeni yaz." };
  if (body.length > 4000) return { error: "Tavsiye çok uzun (en fazla 4000 karakter)." };

  const { error } = await supabase.from("advices").insert({
    post_id: postId,
    author_id: user.id,
    body,
    is_anonymous: isAnonymous,
  });
  if (error) return { error: "Tavsiye kaydedilemedi. Tekrar dene." };

  revalidatePath(`/dert/${postId}`);
  return { error: null, ok: true };
}

/** Yalnız gönderi sahibi çağırabilir (RPC içinde kontrol edilir). */
export async function markSolution(postId: string, adviceId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cozum_toggle", {
    p_post_id: postId,
    p_advice_id: adviceId,
  });
  if (!error) revalidatePath(`/dert/${postId}`);
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (!error) {
    revalidatePath("/");
    redirect("/");
  }
}
