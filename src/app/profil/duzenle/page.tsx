import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ProfileEditForm } from "./profile-edit-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profili düzenle" };

const OTUZ_GUN_MS = 30 * 24 * 60 * 60 * 1000;

export default async function ProfilDuzenlePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/profil/duzenle");

  const p = user.profile;

  // Kullanıcı adı 30 günlük kilitte mi?
  let usernameLocked = false;
  let unlockDate: string | null = null;
  if (p?.username_changed_at) {
    const unlock = new Date(p.username_changed_at).getTime() + OTUZ_GUN_MS;
    if (unlock > Date.now()) {
      usernameLocked = true;
      unlockDate = new Date(unlock).toLocaleDateString("tr-TR");
    }
  }

  return (
    <div className="space-y-5">
      <Link
        href="/profil"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Profilime dön
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Profili düzenle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bilgilerin herkese açık profilinde görünür. Anonim paylaşımların buna
          dahil değildir.
        </p>
      </div>

      <ProfileEditForm
        displayName={p?.display_name ?? ""}
        username={p?.username ?? ""}
        bio={p?.bio ?? ""}
        usernameLocked={usernameLocked}
        unlockDate={unlockDate}
      />
    </div>
  );
}
