"use client";

import { useEffect, useState } from "react";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    fetch("/api/children")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setChild(data.data[0]);
        }
      });
  }, []);

  return (
    <main className="min-h-dvh px-6 pt-8 pb-24">
      <div className="mx-auto max-w-sm">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-olive-muted hover:text-olive-dark cursor-pointer mb-1"
          >
            &#8249; Dashboard
          </button>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-olive-dark">
            Settings
          </h1>
        </div>

        {/* Child info */}
        {child && (
          <div className="rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-5 shadow-[var(--shadow-card)] mb-4">
            <h2 className="font-semibold text-olive-dark mb-2">
              {child.name}
            </h2>
            <p className="text-sm text-olive-muted">
              Born{" "}
              {new Date(child.dateOfBirth + "T00:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Retake quiz */}
        {child && (
          <button
            onClick={() => router.push(`/children/${child.id}/quiz`)}
            className="w-full rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-5 shadow-[var(--shadow-card)] mb-4 text-left cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-all duration-200"
          >
            <p className="font-semibold text-olive-dark">Retake quiz</p>
            <p className="text-sm text-olive-muted mt-1">
              Re-assess milestones with a fresh set of questions.
            </p>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-[var(--radius-button)] border-2 border-red-200 bg-red-50 px-4 py-4 font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 cursor-pointer min-h-[52px]"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
