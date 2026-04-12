"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

export default function NewChildPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-olive-muted mb-1"
            >
              Date of birth
            </label>
            <input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-4 py-3 text-olive-dark focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
          </div>

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
