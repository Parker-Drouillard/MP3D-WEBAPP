export function needsReset(now: Date, resetAt: Date): boolean {
  return now >= resetAt;
}

export function nextResetDate(now: Date, currentResetAt: Date): Date {
  return new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    currentResetAt.getDate(),
    currentResetAt.getHours(),
    currentResetAt.getMinutes(),
    currentResetAt.getSeconds()
  );
}

export function newUsageAfterRequest(currentUsage: number, reset: boolean): number {
  return reset ? 1 : currentUsage + 1;
}

export function isLimitExceeded(newUsage: number, limit: number): boolean {
  return newUsage > limit;
}

export function fairUseStatus(
  monthlyUsage: number,
  limit: number
): 'good' | 'warning' | 'exceeded' {
  const pct = (monthlyUsage / limit) * 100;
  if (pct >= 100) return 'exceeded';
  if (pct >= 80) return 'warning';
  return 'good';
}