"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "giris" | "kayit" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const kayit = mode === "kayit";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    if (kayit) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || email.split("@")[0] },
          emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setError(cevir(error.message));
      } else if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setInfo(
          "Hesabın oluşturuldu. E-postana gelen bağlantıyla doğrulayıp giriş yapabilirsin.",
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(cevir(error.message));
      } else {
        router.push(next);
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function google() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(cevir(error.message));
  }

  return (
    <div className="mx-auto max-w-sm animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">
        {kayit ? "Aramıza katıl" : "Tekrar hoş geldin"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {kayit
          ? "Dertlerini paylaşmak ve tavsiye vermek için bir hesap oluştur."
          : "Dert ortaklığına kaldığın yerden devam et."}
      </p>

      <button
        type="button"
        onClick={google}
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card/60 text-sm font-medium transition hover:border-primary/50"
      >
        <GoogleIcon />
        Google ile devam et
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> veya e-posta ile{" "}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {kayit && (
          <Input
            placeholder="Görünen ad (örn. Deniz)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="nickname"
          />
        )}
        <Input
          type="email"
          required
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          type="password"
          required
          minLength={6}
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={kayit ? "new-password" : "current-password"}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-solved">{info}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Bekle…" : kayit ? "Hesap oluştur" : "Giriş yap"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {kayit ? "Zaten hesabın var mı? " : "Henüz hesabın yok mu? "}
        <Link
          href={kayit ? "/giris" : "/kayit"}
          className="font-medium text-primary hover:underline"
        >
          {kayit ? "Giriş yap" : "Kayıt ol"}
        </Link>
      </p>
    </div>
  );
}

function cevir(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "E-posta veya şifre hatalı.";
  if (/already registered/i.test(msg)) return "Bu e-posta zaten kayıtlı.";
  if (/password should be/i.test(msg)) return "Şifre en az 6 karakter olmalı.";
  if (/provider is not enabled/i.test(msg))
    return "Google girişi henüz yapılandırılmamış.";
  return msg;
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
