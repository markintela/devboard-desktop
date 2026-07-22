import type { TFunction } from "@/lib/i18n/context";

export function timeAgo(iso: string | null, t: TFunction): string {
  if (!iso) return t(d => d.time.never);
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t(d => d.time.justNow);
  if (minutes < 60) return t(d => d.time.minutesAgo, { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t(d => d.time.hoursAgo, { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t(d => d.time.daysAgo, { count: days });
  const months = Math.floor(days / 30);
  if (months < 12) return t(d => d.time.monthsAgo, { count: months });
  return t(d => d.time.yearsAgo, { count: Math.floor(months / 12) });
}
