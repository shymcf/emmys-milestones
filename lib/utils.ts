export function getAgeInMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  return Math.max(0, months);
}

export function formatAge(dateOfBirth: string): string {
  const months = getAgeInMonths(dateOfBirth);
  if (months < 24) {
    return `${months} month${months !== 1 ? "s" : ""} old`;
  }
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) {
    return `${years} year${years !== 1 ? "s" : ""} old`;
  }
  return `${years}y ${remaining}m old`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseDateOnly(s: string): Date {
  return new Date(s + "T00:00:00");
}

export function formatDateOnly(s: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseDateOnly(s).toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "numeric" }
  );
}
