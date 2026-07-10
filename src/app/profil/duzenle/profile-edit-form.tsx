"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateProfile, type EditState } from "./actions";

const BIO_MAX = 300;

type Props = {
  displayName: string;
  username: string;
  bio: string;
  usernameLocked: boolean;
  /** Kilitliyse tekrar değiştirilebileceği tarih (DD.MM.YYYY). */
  unlockDate: string | null;
};

function KaydetButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Kaydediliyor…" : "Kaydet"}
    </Button>
  );
}

export function ProfileEditForm({
  displayName,
  username,
  bio,
  usernameLocked,
  unlockDate,
}: Props) {
  const [state, formAction] = useActionState<EditState, FormData>(
    updateProfile,
    {},
  );
  const [bioLen, setBioLen] = useState(bio.length);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="display_name" className="text-sm font-medium">
          Görünen ad
        </label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          maxLength={40}
          required
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Kartlarında ve profilinde görünen adın.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium">
          Kullanıcı adı
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            @
          </span>
          <Input
            id="username"
            name="username"
            defaultValue={username}
            maxLength={20}
            minLength={3}
            pattern="[A-Za-z0-9_]+"
            disabled={usernameLocked}
            autoComplete="off"
            className="pl-7"
          />
        </div>
        {usernameLocked ? (
          <p className="flex items-center gap-1.5 text-xs text-sensitive">
            <Lock className="h-3 w-3" />
            Kullanıcı adını 30 günde bir değiştirebilirsin
            {unlockDate ? ` — ${unlockDate} sonrası` : ""}.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sadece harf, rakam ve alt çizgi. Değiştirdikten sonra 30 gün
            beklemen gerekir.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="bio" className="text-sm font-medium">
            Hakkında
          </label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {bioLen}/{BIO_MAX}
          </span>
        </div>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          maxLength={BIO_MAX}
          placeholder="Kendinden kısaca bahset (isteğe bağlı)."
          onChange={(e) => setBioLen(e.target.value.length)}
        />
        <p className="text-xs text-muted-foreground">
          Profilinde herkese görünür.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <KaydetButton />
        <Button asChild variant="ghost" size="md">
          <Link href="/profil">Vazgeç</Link>
        </Button>
      </div>
    </form>
  );
}
