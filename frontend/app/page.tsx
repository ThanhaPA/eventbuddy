import { getEvents } from "@/lib/eventbuddy-api";
import { EventAttendanceButton } from "@/components/event-attendance-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const categories = [
  "Technology",
  "Cultural",
  "Sports",
  "Workshop",
  "Hackathon",
  "Seminar",
  "Arts",
  "Academic",
];

const featureCards = [
  {
    title: "Discover your vibe",
    text: "Browse events by category, distance, college, and trending interests.",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    title: "Meet your people",
    text: "Find students with similar interests and build your event circle.",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    title: "Go together",
    text: "Form groups, coordinate plans, and stay updated with reminders.",
    accent: "from-emerald-500 to-teal-500",
  },
];

export default async function Home() {
  const upcomingEvents = await getEvents();
  const featuredEvents = upcomingEvents.slice(0, 3);

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-lg font-black text-white shadow-lg shadow-violet-200">
              E
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">EventBuddy</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/" className="transition hover:text-violet-600">Home</Link>
            <Link href="/events" className="transition hover:text-violet-600">Events</Link>
            <Link href="/dashboard/matches" className="transition hover:text-violet-600">Matches</Link>
            <Link href="/dashboard/groups" className="transition hover:text-violet-600">Groups</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700 sm:inline-flex">
              Login
            </Link>
            <Link href="/register" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-200 transition hover:bg-slate-800">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-900 px-6 py-8 text-white shadow-[0_25px_60px_rgba(76,29,149,0.28)] sm:px-8 lg:px-12 lg:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-100">
                Student discovery platform
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Discover Events.<br />
                Find Your People.
              </h1>

              <p className="mt-4 max-w-xl text-base text-violet-100/90 sm:text-lg">
                Explore what is happening at your college and nearby campuses, connect with students who share your interests, and attend events together.
              </p>

              <form action="/events" method="get" className="mt-7 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-2 shadow-xl shadow-violet-950/10 backdrop-blur-sm">
                <span className="px-3 text-lg text-violet-100">⌕</span>
                <input
                  type="text"
                  name="search"
                  placeholder="Search events, colleges or categories..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-violet-100/70 focus:outline-none"
                />
                <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-violet-50/90">
                {categories.slice(0, 5).map((category) => (
                  <span key={category} className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
              <div className="rounded-2xl bg-slate-950/35 p-4 ring-1 ring-white/10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-violet-100">This week</p>
                    <p className="text-2xl font-bold">{upcomingEvents.length} events</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/25">
                    Live
                  </div>
                </div>

                <div className="space-y-3">
                  {featuredEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-2xl bg-white/6 p-3 ring-1 ring-white/8">
                      <div>
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className="text-xs text-violet-100/80">{event.date}</p>
                      </div>
                      <div className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-50 ring-1 ring-violet-300/20">
                        {event.interested} going
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-3xl font-black tracking-tight text-slate-900">{upcomingEvents.length}</p>
          <p className="mt-1 text-sm text-slate-600">Upcoming events currently listed</p>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {featureCards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br ${card.accent}`} />
              <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
            </div>
          ))}
        </section>

        <section id="events" className="mt-16">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">
                Discover
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Upcoming Events
              </h2>
            </div>
            <Link href="/events" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700">
              View all
            </Link>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/events?category=${encodeURIComponent(category)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === "Technology"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-violet-200 hover:text-violet-700"
                }`}
              >
                {category}
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <article
                key={event.title}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-violet-700 backdrop-blur-sm">
                    {event.category}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">{event.college}</p>
                    <span className="text-xs font-medium text-slate-500">{event.interested} interested</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>📅 {event.date}</p>
                    <p>🕒 {event.time}</p>
                    <p>📍 {event.venue}</p>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <EventAttendanceButton eventId={event.id} />
                    <Link href={`/events/${encodeURIComponent(event.id)}`} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700">
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">
                  Explore
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">More events</h2>
              </div>
              <Link href="/events" className="text-sm font-medium text-violet-700">Browse all</Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.slice(3, 6).map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                  <div>
                    <p className="font-semibold text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-600">{event.college}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-white px-2 py-1">{event.date}</span>
                      <span className="rounded-full bg-white px-2 py-1">{event.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link href={`/events/${encodeURIComponent(event.id)}`} className="mt-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-200 hover:text-violet-700">
                      View
                    </Link>
                  </div>
                </div>
              ))}
              {upcomingEvents.length <= 3 ? <p className="py-4 text-sm text-slate-500">More events will appear here as they are added.</p> : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200">
              Why students use it
            </p>
            <h2 className="mt-2 text-2xl font-bold">How EventBuddy Works</h2>

            <div className="mt-6 space-y-5">
              {[
                ["1", "Discover events that match your interests"],
                ["2", "See students with common event goals"],
                ["3", "Connect, form groups, and attend together"],
              ].map(([step, text]) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 font-bold text-white shadow-md shadow-violet-900/20">
                    {step}
                  </div>
                  <p className="pt-1 text-sm text-slate-200">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
