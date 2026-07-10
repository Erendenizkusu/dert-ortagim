import {
  MARK_ARM_LEFT,
  MARK_ARM_RIGHT,
  MARK_HEART_LEFT,
  MARK_HEART_RIGHT,
} from "@/lib/brand";

type BrandMarkProps = {
  className?: string;
  /** Verilirse ikon erişilebilir bir görsel olur; verilmezse dekoratif sayılır. */
  title?: string;
};

/**
 * İki kol ortada kenetlenir (el sıkışma); üstünde birlikte yaratılan bir kalp.
 * Tek renk (currentColor) — her zeminde ve her boyutta çalışır.
 */
export function BrandMark({ className, title }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        d={MARK_ARM_LEFT}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={MARK_ARM_RIGHT}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path d={MARK_HEART_LEFT} fill="currentColor" />
      <path d={MARK_HEART_RIGHT} fill="currentColor" />
    </svg>
  );
}
