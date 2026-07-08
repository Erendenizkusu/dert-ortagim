import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Kayıt ol" };

export default function KayitPage() {
  return (
    <Suspense>
      <AuthForm mode="kayit" />
    </Suspense>
  );
}
