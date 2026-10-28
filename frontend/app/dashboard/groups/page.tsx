"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { EventBuddyNav, SectionHeading } from "@/components/eventbuddy-ui";
import { createGroup, getDiscoverableGroups, getEvents, joinGroup, leaveGroup, type EventCardData } from "@/lib/eventbuddy-api";

type GroupSummary = { id: string; name: string; event: string; members: number; maxMembers: number; status: string };
type DiscoverableGroup = { id: string; name: string; event: { title: string }; members: unknown[] };
const apiBase = process.env.NEXT_PUBLIC_EVENTBUDDY_API_URL ?? "http://localhost:4000";

export default function DashboardGroupsPage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [discoverable, setDiscoverable] = useState<DiscoverableGroup[]>([]);
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function reload() {
    setError("");
    try {
      const [groupResponse, availableEvents, availableGroups] = await Promise.all([
        fetch(`${apiBase}/dashboard/groups`, { credentials: "include", cache: "no-store" }),
        getEvents(),
        getDiscoverableGroups(),
      ]);
      const payload = await groupResponse.json();
      if (!groupResponse.ok) throw new Error(payload.message ?? "Could not load groups.");
      setGroups(payload);
      setEvents(availableEvents);
      setDiscoverable(availableGroups);
      if (!eventId && availableEvents[0]) setEventId(availableEvents[0].id);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load groups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${apiBase}/dashboard/groups`, { credentials: "include", cache: "no-store" }),
      getEvents(),
      getDiscoverableGroups(),
    ])
      .then(async ([groupResponse, availableEvents, availableGroups]) => {
        const payload = await groupResponse.json();
        if (!groupResponse.ok) throw new Error(payload.message ?? "Could not load groups.");
        if (!active) return;
        setGroups(payload);
        setEvents(availableEvents);
        setDiscoverable(availableGroups);
        if (availableEvents[0]) setEventId(availableEvents[0].id);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load groups.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createGroup(name, eventId);
      setName("");
      await reload();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create group.");
    }
  }

  async function changeMembership(action: (id: string) => Promise<unknown>, id: string) {
    try {
      await action(id);
      await reload();
    } catch (membershipError) {
      setError(membershipError instanceof Error ? membershipError.message : "Could not update group membership.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Groups" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Groups" title="My groups" />
        <form onSubmit={submitCreate} className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
          <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="New group name" aria-label="New group name" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <select required value={eventId} onChange={(event) => setEventId(event.target.value)} aria-label="Group event" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            {events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Create group</button>
        </form>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        {loading ? <p className="py-10 text-center text-sm text-slate-600">Loading groups...</p> : null}
        {!loading && groups.length === 0 ? <p className="py-10 text-center text-sm text-slate-600">You have not joined any groups yet.</p> : null}
        <div className="grid gap-6 md:grid-cols-3">
          {groups.map((group) => (
            <article key={group.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">{group.name}</h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{group.status}</span>
              </div>
              <p className="text-sm text-slate-600">Event: {group.event}</p>
              <p className="mt-3 text-sm text-slate-600">Members: {group.members}/{group.maxMembers}</p>
              <div className="mt-5 flex gap-3">
                <Link href={`/groups/${encodeURIComponent(group.id)}`} className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800">Open group</Link>
                <button onClick={() => void changeMembership(leaveGroup, group.id)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700">Leave</button>
              </div>
            </article>
          ))}
        </div>
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-bold">Discover groups</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {discoverable.map((group) => (
              <article key={group.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold">{group.name}</p>
                <p className="mt-1 text-sm text-slate-600">{group.event.title} · {group.members.length} members</p>
                <button onClick={() => void changeMembership(joinGroup, group.id)} className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">Join group</button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}