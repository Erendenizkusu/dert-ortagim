import {
  Users,
  MessageSquarePlus,
  Clock,
  CircleCheck,
  Flag,
  AlertTriangle,
  EyeOff,
} from "lucide-react";
import type { ModStats } from "@/lib/database.types";
import { cn } from "@/lib/utils";

function oran(pay: number, payda: number): string {
  if (payda <= 0) return "—";
  return `%${Math.round((pay / payda) * 100)}`;
}

function sureFormat(saat: number | null): string {
  if (saat == null) return "—";
  if (saat < 1) return `${Math.round(saat * 60)} dk`;
  if (saat < 48) return `${saat} sa`;
  return `${Math.round(saat / 24)} gün`;
}

export function ModStatsPanel({ stats }: { stats: ModStats }) {
  const cevapsizVurgu = stats.unanswered_over_24h > 0;

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatCard
          icon={<MessageSquarePlus className="h-4 w-4" />}
          value={`${stats.posts_today} / ${stats.advices_today}`}
          label="bugün dert / tavsiye"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          value={stats.users_total}
          label={`kullanıcı · +${stats.users_new_7d} (7g)`}
        />
        <StatCard
          icon={<CircleCheck className="h-4 w-4" />}
          value={oran(stats.solved_posts, stats.posts_total)}
          label="çözülme oranı"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          value={sureFormat(stats.avg_hours_to_first_advice)}
          label="ilk tavsiyeye ort. süre"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          value={stats.unanswered_over_24h}
          label="24 saattir cevapsız"
          tone={cevapsizVurgu ? "warn" : undefined}
        />
        <StatCard
          icon={<Flag className="h-4 w-4" />}
          value={stats.reports_open}
          label="açık rapor"
        />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <EyeOff className="h-3 w-3" /> {stats.hidden_total} gizli içerik
        </span>
        <span>
          Toplam {stats.posts_total} dert · {stats.advices_total} tavsiye
        </span>
        <span>
          {oran(stats.unanswered_total, stats.posts_total)} dert hâlâ cevapsız
        </span>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  tone?: "warn";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border p-3",
        tone === "warn"
          ? "border-sensitive/40 bg-sensitive/[0.08]"
          : "border-border bg-card/50",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs",
          tone === "warn" ? "text-sensitive" : "text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          tone === "warn" ? "text-sensitive" : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}
