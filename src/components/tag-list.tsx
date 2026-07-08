import Link from "next/link";

export function TagList({ tags }: { tags: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <Link
          key={t}
          href={`/etiket/${encodeURIComponent(t)}`}
          className="rounded-full bg-accent/60 px-2 py-0.5 text-xs font-medium text-accent-foreground transition hover:bg-accent"
        >
          #{t}
        </Link>
      ))}
    </div>
  );
}
