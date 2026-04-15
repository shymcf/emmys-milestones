"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

function buildYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }
  return years;
}

export default function NewChildPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const daysInMonth = getDaysInMonth(Number(birthMonth), Number(birthYear));
  const dateOfBirth =
    birthMonth && birthDay && birthYear
      ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
      : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dateOfBirth }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push(`/children/${data.data.id}/quiz`);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl text-terracotta text-center mb-2">
          Add your child
        </h1>
        <p className="text-olive-muted text-center text-sm mb-8">
          We&apos;ll use their age to show relevant milestones.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-olive-muted mb-1"
            >
              Child&apos;s name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-4 py-3 text-olive-dark placeholder:text-olive-light focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              placeholder="Emmy"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-olive-muted mb-1">
              Date of birth
            </legend>
            <div className="grid grid-cols-[1fr_0.6fr_0.8fr] gap-2">
              <select
                value={birthMonth}
                onChange={(e) => {
                  setBirthMonth(e.target.value);
                  if (Number(birthDay) > getDaysInMonth(Number(e.target.value), Number(birthYear))) {
                    setBirthDay("");
                  }
                }}
                required
                className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-3 py-3 text-olive-dark focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 appearance-none cursor-pointer"
              >
                <option value="" disabled>Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                required
                className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-3 py-3 text-olive-dark focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 appearance-none cursor-pointer"
              >
                <option value="" disabled>Day</option>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                ))}
              </select>
              <select
                value={birthYear}
                onChange={(e) => {
                  setBirthYear(e.target.value);
                  if (Number(birthDay) > getDaysInMonth(Number(birthMonth), Number(e.target.value))) {
                    setBirthDay("");
                  }
                }}
                required
                className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-3 py-3 text-olive-dark focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 appearance-none cursor-pointer"
              >
                <option value="" disabled>Year</option>
                {buildYearOptions().map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-[var(--radius-input)] px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-[var(--radius-button)] bg-terracotta px-6 py-4 font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[52px]"
          >
            {loading ? "Saving..." : "Next: Quick checkup"}
          </button>
        </form>
      </div>
    </main>
  );
}
