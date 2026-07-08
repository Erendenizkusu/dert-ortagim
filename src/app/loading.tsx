export default function Loading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-border bg-card/40"
        />
      ))}
    </div>
  );
}
