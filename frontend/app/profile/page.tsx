"use client";

import { FormEvent, useEffect, useState } from "react";
import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { getProfileData, updateProfileData } from "@/lib/eventbuddy-api";
import { getColleges } from "@/lib/eventbuddy-api";

type Profile = {
  name: string;
  role: string;
  college: string;
  collegeId: string | null;
  interests: string[];
  about: string;
  stats: { tracked: number; groups: number; events: number };
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [interests, setInterests] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState<{ id: string; name: string; city: string }[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getProfileData()
      .then((data: Profile) => {
        if (!active) return;
        setProfile(data);
        setName(data.name);
        setAbout(data.about);
        setInterests(data.interests.join(", "));
        setCollegeId(data.collegeId ?? "");
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load profile.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    getColleges().then((items) => { if (active) setColleges(items); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateProfileData({
        name,
        bio: about,
        interests: interests.split(",").map((interest) => interest.trim()).filter(Boolean),
        collegeId: collegeId || null,
      }) as Profile;
      setProfile(updated);
      setMessage("Profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Home" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        {!profile && !error ? <p className="py-12 text-center text-sm text-slate-600">Loading profile...</p> : null}
        {profile ? (
          <form onSubmit={save} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-2xl font-black text-violet-700">{name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Your profile</p>
                <p className="mt-1 text-sm text-slate-600">{profile.role} · {profile.college}</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Name
                <input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
              <label className="text-sm font-medium text-slate-700">Interests, separated by commas
                <input value={interests} onChange={(event) => setInterests(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
              <label className="text-sm font-medium text-slate-700">College
                <select value={collegeId} onChange={(event) => setCollegeId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <option value="">Choose later</option>
                  {colleges.map((college) => <option key={college.id} value={college.id}>{college.name} · {college.city}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">About
                <textarea maxLength={2000} rows={5} value={about} onChange={(event) => setAbout(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>{profile.stats.tracked} interests</span>
              <span>{profile.stats.groups} groups</span>
              <span>{profile.stats.events} events</span>
            </div>
            {message ? <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p> : null}
            <button disabled={saving} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save profile"}</button>
          </form>
        ) : null}
      </main>
    </div>
  );
}