import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** OAuth / e-posta doğrulama sonrası kod -> oturum takası. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Vercel gibi proxy arkasında gerçek host x-forwarded-host'ta gelir;
      // yerelde origin'i kullan, prod'da forward edilen host'a https ile dön.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`;
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/giris?error=auth`);
}
