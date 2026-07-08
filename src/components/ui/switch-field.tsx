"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Form içi toggle: gizli checkbox + görsel anahtar. */
export function SwitchField({
  name,
  label,
  description,
  defaultChecked = false,
  icon,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  icon?: React.ReactNode;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card/40 p-3 transition",
        checked && "border-primary/40 bg-primary/[0.06]",
      )}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="sr-only"
      />
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked && "translate-x-5",
          )}
        />
      </span>
    </label>
  );
}
