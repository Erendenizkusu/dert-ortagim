import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Giriş yap" };

export default function GirisPage() {
  return (
    <Suspense>
      <AuthForm mode="giris" />
    </Suspense>
  );
}
