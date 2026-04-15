"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/login");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-heading)] text-5xl text-terracotta text-center mb-8">
          totter
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-olive-muted mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-4 py-3 text-olive-dark placeholder:text-olive-light focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-olive-muted mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-4 py-3 text-olive-dark placeholder:text-olive-light focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-olive-muted mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-4 py-3 text-olive-dark placeholder:text-olive-light focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              placeholder="Confirm your password"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-olive-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-terracotta hover:text-terracotta-dark cursor-pointer"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
