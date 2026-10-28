"use client";

import { EventBuddyNav, EventCard, SectionHeading } from "@/components/eventbuddy-ui";
import { searchEvents } from "@/lib/eventbuddy-api";
import { FormEvent, useEffect, useState } from "react";
import type { EventCardData } from "@/lib/eventbuddy-api";

const categories = [
  "All",
  "Technology",
  "Cultural",
  "Sports",
  "Workshop",
  "Hackathon",
  "Seminar",
  "Arts",
  "Academic",
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents(searchTerm = search, selectedCategory = category) {
    setLoading(true);
    setError("");
    try {
      setEvents(await searchEvents({ search: searchTerm, category: selectedCategory }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") ?? "";
    const requestedCategory = params.get("category") ?? "All";
    const initialCategory = categories.includes(requestedCategory) ? requestedCategory : "All";
    Promise.resolve()
      .then(() => {
        if (active) setSearch(initialSearch);
        if (active) setCategory(initialCategory);
        return searchEvents({ search: initialSearch, category: initialCategory });
      })
      .then((items) => {
        if (active) setEvents(items);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load events.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadEvents();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Events" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Browse" title="All Events" action="Filter" />

        <form onSubmit={submitSearch} className="mb-6 flex gap-3">
          <input name="search" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search events" placeholder="Search events, venues or categories" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Search</button>
        </form>

        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setCategory(category);
                void loadEvents(search, category);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === "All"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-violet-200 hover:text-violet-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {error ? <p role="alert" className="mb-6 text-sm text-red-700">{error}</p> : null}
        {loading ? <p className="py-12 text-center text-sm text-slate-600">Loading events...</p> : null}
        {!loading && !error && events.length === 0 ? <p className="py-12 text-center text-sm text-slate-600">No events match your search.</p> : null}
        <div className="grid gap-6 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </main>
    </div>
  );
}
