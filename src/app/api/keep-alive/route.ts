import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Supabase ücretsiz planı ~7 gün hareketsiz kalan projeyi duraklatır.
 * Vercel Cron bu uç noktayı her gün çağırır; küçük bir DB sorgusu
 * projeyi "aktif" tutar. (vercel.json → crons)
 */
export async function GET(request: Request) {
  // CRON_SECRET tanımlıysa Vercel isteğe `Authorization: Bearer <secret>` ekler.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  const { error } = await supabase.from("posts_public").select("id").limit(1);

  if (error) {
    console.error("[keep-alive] Supabase sorgusu başarısız:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 503 });
  }

  return Response.json({ ok: true, at: new Date().toISOString() });
}
