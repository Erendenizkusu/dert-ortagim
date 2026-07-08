import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Geçerli oturumdaki kullanıcıyı ve profilini döndürür (yoksa null). */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string | null;
  profile: Profile | null;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return { id: user.id, email: user.email ?? null, profile };
  } catch {
    // Supabase yapılandırılmamış/erişilemiyorsa oturumsuz devam et.
    return null;
  }
}
