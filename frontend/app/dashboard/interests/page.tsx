"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventBuddyNav, SectionHeading } from "@/components/eventbuddy-ui";
import { getInterestsData, setEventAttendance } from "@/lib/eventbuddy-api";

type InterestedEvent = { id: string; title: string; college: string; date: string; category: string; image?: string | null };

export default function DashboardInterestsPage() {
  const [events, setEvents] = useState<InterestedEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getInterestsData()
      .then((data: InterestedEvent[]) => { if (active) setEvents(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load your events."); });
    return () => { active = false; };
  }, []);

  async function remove(id: string) {
    try {
      await setEventAttendance(id);
      setEvents((items) => items.filter((item) => item.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove event.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Matches" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="My interests" title="Events you’re attending" />
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => <article key={event.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${event.image ?? "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80"})` }} />
            <div className="p-5"><div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{event.category}</span><button onClick={() => void remove(event.id)} className="text-xs font-semibold text-red-700">Remove</button></div><h2 className="text-xl font-bold">{event.title}</h2><p className="mt-1 text-sm text-slate-600">{event.college} · {event.date}</p><Link href={`/events/${encodeURIComponent(event.id)}`} className="mt-4 inline-block text-sm font-semibold text-violet-700">View event</Link></div>
          </article>)}
        </div>
        {!error && events.length === 0 ? <p className="py-12 text-center text-sm text-slate-600">You haven’t marked any events yet. <Link href="/events" className="font-semibold text-violet-700">Explore events</Link></p> : null}
      </main>
    </div>
  );
}