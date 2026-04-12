import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-6xl text-terracotta mb-2">
          totter
        </h1>
        <p className="text-olive-muted text-lg mb-10">
          Every wobble is progress.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="block w-full rounded-[var(--radius-button)] bg-terracotta px-6 py-4 text-center font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark hover:translate-y-[-1px] cursor-pointer"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="block w-full rounded-[var(--radius-button)] border-2 border-sand-light bg-warm-white px-6 py-4 text-center font-semibold text-terracotta transition-all duration-200 hover:bg-terracotta-light cursor-pointer"
          >
            Create account
          </Link>
        </div>

        <p className="mt-12 text-sm text-olive-light">
          Track milestones. Get tips. Celebrate growth.
        </p>
      </div>
    </main>
  );
}
