import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl">🫥</p>
      <h1 className="mt-4 text-lg font-semibold">Burada bir şey yok</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Aradığın dert kaldırılmış ya da hiç var olmamış olabilir.
      </p>
      <Button asChild className="mt-5">
        <Link href="/">Akışa dön</Link>
      </Button>
    </div>
  );
}
