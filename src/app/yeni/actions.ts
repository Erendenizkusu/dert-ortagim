"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KATEGORI_MAP } from "@/lib/constants";
import { normalizeTag } from "@/lib/utils";

export interface FormState {
  error: string | null;
}

export async function createPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Önce giriş yapmalısın." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const isAnonymous = formData.get("is_anonymous") === "on";
  const isSensitive = formData.get("is_sensitive") === "on";

  if (title.length < 3) return { error: "Başlık en az 3 karakter olmalı." };
  if (title.length > 160) return { error: "Başlık en fazla 160 karakter olabilir." };
  if (body.length < 1) return { error: "Derdini birkaç cümleyle anlat." };
  if (body.length > 8000) return { error: "Metin çok uzun (en fazla 8000 karakter)." };

  const category = KATEGORI_MAP[categoryRaw] ? categoryRaw : null;

  const tags = Array.from(
    new Set(
      tagsRaw
        .split(/[,\s]+/)
        .map(normalizeTag)
        .filter(Boolean),
    ),
  ).slice(0, 5);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      body,
      category,
      tags,
      is_anonymous: isAnonymous,
      is_sensitive: isSensitive,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Gönderi kaydedilemedi. Lütfen tekrar dene." };
  }

  revalidatePath("/");
  redirect(`/dert/${data.id}`);
}
