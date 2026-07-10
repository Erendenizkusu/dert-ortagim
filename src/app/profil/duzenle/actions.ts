"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EditState = { error?: string };

function temizleHata(mesaj: string): string {
  if (mesaj.includes("duplicate key") || mesaj.includes("unique")) {
    return "Bu kullanıcı adı zaten alınmış";
  }
  return mesaj;
}

export async function updateProfile(
  _prev: EditState,
  formData: FormData,
): Promise<EditState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const display_name = String(formData.get("display_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const bioRaw = String(formData.get("bio") ?? "").trim();
  const bio = bioRaw === "" ? null : bioRaw;

  if (display_name.length < 1) {
    return { error: "Görünen ad boş olamaz." };
  }

  // Kullanıcı adı alanı kilitliyken form gönderilmez (boş gelir) -> dokunma,
  // yalnız ad/bio güncellensin. Değeri olduğunda güncellemeye dahil et.
  const payload: {
    display_name: string;
    bio: string | null;
    username?: string;
  } = { display_name, bio };
  if (username.length > 0) payload.username = username;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: temizleHata(error.message) };

  revalidatePath("/profil");
  redirect("/profil");
}
