"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Temayı değiştir"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-primary/50"
    >
      {mounted && dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
