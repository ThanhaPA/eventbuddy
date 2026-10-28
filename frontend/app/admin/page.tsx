"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardStat, EventBuddyNav } from "@/components/eventbuddy-ui";
import { getAdminOverviewData } from "@/lib/eventbuddy-api";

type Overview = { stats: { value: string; label: string }[] };

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminOverviewData()
      .then((data: Overview) => { if (active) setOverview(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Administrator sign-in required."); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Admin" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black">Admin overview</h1>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        {!overview && !error ? <p className="py-10 text-center text-sm text-slate-600">Loading admin summary...</p> : null}
        {overview ? <section className="grid gap-4 md:grid-cols-4">{overview.stats.map((stat) => <DashboardStat key={stat.label} {...stat} />)}</section> : null}
        <nav className="mt-10 flex flex-wrap gap-3">
          {[["Events", "/admin/events"], ["Colleges", "/admin/colleges"], ["Users", "/admin/users"], ["Analytics", "/admin/analytics"]].map(([label, href]) => <Link key={href} href={href} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:border-violet-300">{label}</Link>)}
        </nav>
      </main>
    </div>
  );
}