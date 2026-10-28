"use client";

import Link from "next/link";
import { useState } from "react";
import { setEventAttendance } from "@/lib/eventbuddy-api";

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export function EventBuddyNav({ active = "Home" }: { active?: string }) {
  const navItems: NavItem[] = [
    { label: "Home", href: "/", active: active === "Home" },
    { label: "Events", href: "/events", active: active === "Events" },
    { label: "Matches", href: "/dashboard/matches", active: active === "Matches" },
    { label: "Groups", href: "/dashboard/groups", active: active === "Groups" },
    { label: "Admin", href: "/admin", active: active === "Admin" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-lg font-black text-white shadow-lg shadow-violet-200">
            E
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-slate-900">EventBuddy</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={item.active ? "text-violet-700" : "transition hover:text-violet-600"}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700 sm:inline-flex"
          >
            Login
          </a>
          <a
            href="/register"
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-200 transition hover:bg-slate-800"
          >
            Join Now
          </a>
        </div>
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      {action ? (
        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700">
          {action}
        </button>
      ) : null}
    </div>
  );
}

export function EventCard({
  id,
  title,
  college,
  date,
  time,
  venue,
  category,
  interested,
  image,
}: {
  id: string;
  title: string;
  college: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  interested: number;
  image: string;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function toggleAttendance() {
    setSubmitting(true);
    setMessage("");
    try {
      await setEventAttendance(id);
      setMessage("Attendance updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update attendance.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 w-full overflow-hidden">
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-violet-700 backdrop-blur-sm">
          {category}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">{college}</p>
          <span className="text-xs font-medium text-slate-500">{interested} interested</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900">{title}</h3>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>📅 {date}</p>
          <p>🕒 {time}</p>
          <p>📍 {venue}</p>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={toggleAttendance} disabled={submitting} className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
            {submitting ? "Updating..." : "I&apos;m Interested"}
          </button>
          <Link
            href={`/events/${encodeURIComponent(id)}`}
            className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
          >
            Details
          </Link>
        </div>
        {message ? <p role="status" className="mt-3 text-xs text-slate-600">{message}</p> : null}
      </div>
    </article>
  );
}

export function DashboardStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}
