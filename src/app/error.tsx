"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl">🌧️</p>
      <h1 className="mt-4 text-lg font-semibold">Bir şeyler ters gitti</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Veriler yüklenirken bir sorun oldu. Supabase bağlantı ayarların (
        <code>.env.local</code>) doğru mu diye kontrol edebilir ya da tekrar
        deneyebilirsin.
      </p>
      <div className="mt-5 flex gap-2">
        <Button onClick={reset}>Tekrar dene</Button>
        <Button asChild variant="outline">
          <Link href="/">Ana sayfa</Link>
        </Button>
      </div>
    </div>
  );
}
