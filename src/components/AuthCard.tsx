import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const authField = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
export const authBtn = "w-full rounded-xl bg-foreground py-3 text-sm font-bold text-background disabled:opacity-50";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      <SiteHeader />
      <main className="mx-auto max-w-sm px-4 py-8">
        <div className="space-y-3 rounded-2xl bg-card p-6 shadow-sm">
          <h1 className="text-xl font-extrabold">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
