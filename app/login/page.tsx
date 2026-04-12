"use client";

import { useState } from "react";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
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
              className="w-full rounded-[var(--radius-input)] border border-sand-light bg-warm-white px-4 py-3 text-olive-dark placeholder:text-olive-light focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              placeholder="Your password"
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
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-olive-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-terracotta hover:text-terracotta-dark cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
