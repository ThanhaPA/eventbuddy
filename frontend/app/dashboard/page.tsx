"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardStat, EventBuddyNav, SectionHeading } from "@/components/eventbuddy-ui";
import { connectWithUser, getDashboardData } from "@/lib/eventbuddy-api";

type Dashboard = {
  stats: { value: string; label: string }[];
  upcoming: { title: string; date: string; college: string }[];
  recommended: { id: string; title: string; college: string }[];
  matches: { id: string; name: string; department: string; score: number; common: string[]; connectionStatus: string | null }[];
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState("");

  useEffect(() => {
    let active = true;
    getDashboardData()
      .then((data: Dashboard) => { if (active) setDashboard(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load your dashboard."); });
    return () => { active = false; };
  }, []);

  async function connect(id: string) {
    setConnecting(id);
    try {
      await connectWithUser(id);
      setDashboard((current) => current ? { ...current, matches: current.matches.map((match) => match.id === id ? { ...match, connectionStatus: "pending" } : match) } : current);
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Could not send request.");
    } finally { setConnecting(""); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Matches" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Dashboard</p><h1 className="mt-2 text-4xl font-black">Your campus activity</h1></div>
          <Link href="/profile" className="rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-slate-200">View profile</Link>
        </div>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        {!dashboard && !error ? <p className="py-12 text-center text-sm text-slate-600">Loading your dashboard...</p> : null}
        {dashboard ? <>
          <section className="grid gap-4 md:grid-cols-3">{dashboard.stats.map((stat) => <DashboardStat key={stat.label} {...stat} />)}</section>
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            <div><SectionHeading eyebrow="Planning" title="Events you’re attending" />
              <div className="space-y-3">{dashboard.upcoming.map((item) => <article key={`${item.title}-${item.date}`} className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold">{item.title}</h2><p className="text-sm text-slate-600">{item.college} · {item.date}</p></article>)}{dashboard.upcoming.length === 0 ? <p className="text-sm text-slate-600">You haven’t marked any events yet.</p> : null}</div>
            </div>
            <div><SectionHeading eyebrow="Discover" title="Upcoming events" />
              <div className="space-y-3">{dashboard.recommended.map((item) => <article key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><div><h2 className="font-bold">{item.title}</h2><p className="text-sm text-slate-600">{item.college}</p></div><Link href={`/events/${encodeURIComponent(item.id)}`} className="text-sm font-semibold text-violet-700">Explore</Link></article>)}</div>
            </div>
          </section>
          <section className="mt-12"><SectionHeading eyebrow="Connections" title="People with shared interests" />
            <div className="grid gap-4 md:grid-cols-3">{dashboard.matches.map((match) => <article key={match.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">{match.name}</h2><p className="mt-1 text-sm text-slate-600">{match.department} · {match.score}% match</p><p className="mt-3 text-sm text-violet-700">{match.common.join(", ") || "Same college"}</p><button disabled={Boolean(match.connectionStatus) || connecting === match.id} onClick={() => void connect(match.id)} className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{match.connectionStatus ? `Request ${match.connectionStatus}` : connecting === match.id ? "Sending..." : "Connect"}</button></article>)}</div>
          </section>
        </> : null}
      </main>
    </div>
  );
}