"use client";

import { useEffect, useState } from "react";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/children")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setChildren(data.data);
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

        {/* Children list */}
        <h2 className="text-xs font-bold text-olive-light uppercase tracking-wider mb-3">
          Children
        </h2>
        <div className="flex flex-col gap-3 mb-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-olive-dark">{child.name}</h3>
              </div>
              <p className="text-sm text-olive-muted mb-3">
                Born{" "}
                {new Date(child.dateOfBirth + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" }
                )}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/children/${child.id}/quiz`)}
                  className="text-sm font-semibold text-terracotta hover:text-terracotta-dark cursor-pointer"
                >
                  Retake quiz
                </button>
                <button
                  onClick={() => setConfirmingDelete(child.id)}
                  className="text-sm font-semibold text-red-400 hover:text-red-600 cursor-pointer"
                >
                  Remove
                </button>
              </div>
              {confirmingDelete === child.id && (
                <div className="mt-3 pt-3 border-t border-sand-light">
                  <p className="text-sm text-olive-muted mb-3">
                    Remove {child.name} and all their milestones? This can&apos;t
                    be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setDeleting(true);
                        const res = await fetch("/api/children", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ childId: child.id }),
                        });
                        if (res.ok) {
                          setChildren((prev) =>
                            prev.filter((c) => c.id !== child.id)
                          );
                        }
                        setDeleting(false);
                        setConfirmingDelete(null);
                      }}
                      disabled={deleting}
                      className="rounded-[var(--radius-button)] bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                    >
                      {deleting ? "Removing..." : "Yes, remove"}
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(null)}
                      className="rounded-[var(--radius-button)] bg-sand-light px-4 py-2 text-sm font-semibold text-olive-muted hover:bg-sand cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add child */}
        <Link
          href="/children/new"
          className="flex items-center justify-center gap-2 w-full rounded-[var(--radius-card)] border-2 border-dashed border-sand-light p-4 text-sm font-semibold text-olive-muted transition-all duration-200 hover:border-terracotta hover:text-terracotta cursor-pointer mb-6"
        >
          + Add another child
        </Link>

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
