"use client";

import { FormEvent, useEffect, useState } from "react";
import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { createAdminEvent, getAdminEvents, updateAdminEvent } from "@/lib/eventbuddy-api";

type AdminEvent = { id: string; title: string; description: string; date: string; time: string; venue: string; category: string; registrationUrl?: string | null; college?: { name: string } | null };
const emptyForm = { title: "", description: "", date: "", time: "", venue: "", category: "Technology", registrationUrl: "" };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  async function reload() {
    try { setEvents(await getAdminEvents() as AdminEvent[]); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Admin access required."); }
  }

  useEffect(() => {
    let active = true;
    getAdminEvents()
      .then((data: AdminEvent[]) => { if (active) setEvents(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Admin access required."); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) await updateAdminEvent(editingId, form);
      else await createAdminEvent(form);
      setForm(emptyForm);
      setEditingId("");
      await reload();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Could not save event."); }
  }

  function edit(item: AdminEvent) {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description, date: new Date(item.date).toISOString().slice(0, 10), time: item.time, venue: item.venue, category: item.category, registrationUrl: item.registrationUrl ?? "" });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Admin" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Manage events</h1>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Time" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input type="url" pattern="https://.*" value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} placeholder="Organizer registration URL (HTTPS)" className="rounded-xl border border-slate-200 px-4 py-3" />
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-xl border border-slate-200 px-4 py-3" />
          <div className="flex gap-3 sm:col-span-2">
            <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">{editingId ? "Save event" : "Create event"}</button>
            {editingId ? <button type="button" onClick={() => { setEditingId(""); setForm(emptyForm); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm">Cancel</button> : null}
          </div>
        </form>
        <div className="space-y-3">
          {events.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div><h2 className="font-bold">{item.title}</h2><p className="text-sm text-slate-600">{item.college?.name ?? "College not set"} · {item.category} · {new Date(item.date).toLocaleDateString()}</p></div>
            <button onClick={() => edit(item)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">Edit</button>
          </article>)}
        </div>
      </main>
    </div>
  );
}