"use client";

import { FormEvent, useEffect, useState } from "react";
import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { createAdminCollege, getAdminColleges, updateAdminCollege } from "@/lib/eventbuddy-api";

type College = { id: string; name: string; city: string; state?: string | null; country: string; description?: string | null; website?: string | null };
const emptyCollege = { name: "", city: "", state: "", country: "India", description: "", website: "" };

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [form, setForm] = useState(emptyCollege);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  async function reload() {
    try { setColleges(await getAdminColleges() as College[]); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Admin access required."); }
  }

  useEffect(() => {
    let active = true;
    getAdminColleges()
      .then((data: College[]) => { if (active) setColleges(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Admin access required."); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editingId) await updateAdminCollege(editingId, form);
      else await createAdminCollege(form);
      setEditingId("");
      setForm(emptyCollege);
      await reload();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Could not save college."); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Admin" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Manage colleges</h1>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="College name" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website URL" className="rounded-xl border border-slate-200 px-4 py-3" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-xl border border-slate-200 px-4 py-3" />
          <div className="flex gap-3 sm:col-span-2">
            <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">{editingId ? "Save college" : "Add college"}</button>
            {editingId ? <button type="button" onClick={() => { setEditingId(""); setForm(emptyCollege); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm">Cancel</button> : null}
          </div>
        </form>
        <div className="grid gap-4 md:grid-cols-3">
          {colleges.map((college) => <article key={college.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold">{college.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{college.city}{college.state ? `, ${college.state}` : ""}, {college.country}</p>
            {college.website ? <a href={college.website} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-violet-700">Website</a> : null}
            <button onClick={() => { setEditingId(college.id); setForm({ name: college.name, city: college.city, state: college.state ?? "", country: college.country, description: college.description ?? "", website: college.website ?? "" }); }} className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">Edit</button>
          </article>)}
        </div>
      </main>
    </div>
  );
}