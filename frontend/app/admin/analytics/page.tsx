"use client";

import { useEffect, useState } from "react";
import { DashboardStat, EventBuddyNav } from "@/components/eventbuddy-ui";
import { getAdminOverviewData } from "@/lib/eventbuddy-api";

type Analytics = { stats: { value: string; label: string }[] };

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminOverviewData()
      .then((data: Analytics) => { if (active) setAnalytics(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Administrator sign-in required."); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Admin" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Analytics</h1>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        {!analytics && !error ? <p className="py-10 text-center text-sm text-slate-600">Loading counts...</p> : null}
        {analytics ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{analytics.stats.map((item) => <DashboardStat key={item.label} {...item} />)}</section> : null}
        <p className="mt-6 text-sm text-slate-500">Metrics are database record counts. Engagement, views, and ratings require additional tracking data.</p>
      </main>
    </div>
  );
}