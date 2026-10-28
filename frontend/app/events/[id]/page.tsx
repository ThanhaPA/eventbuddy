import { notFound } from "next/navigation";
import { EventAttendanceButton } from "@/components/event-attendance-button";
import { EventViewTracker } from "@/components/event-view-tracker";
import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { getEventById } from "@/lib/eventbuddy-api";

type EventDetails = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  imageUrl?: string | null;
  registrationUrl?: string | null;
  interestedCount?: number;
  college?: { name?: string } | null;
  attendees?: { id: string; name: string }[];
  _count?: { attendees: number };
};

export default async function EventDetailPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  let event: EventDetails;
  try {
    event = await getEventById(id) as EventDetails;
  } catch (error) {
    if (error instanceof Error && error.message === "Event not found.") notFound();
    throw error;
  }

  const attendees = event.attendees ?? [];
  const interestedCount = event._count?.attendees ?? event.interestedCount ?? attendees.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Events" />
      <EventViewTracker eventId={id} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div
            className="h-72 w-full bg-cover bg-center"
            role="img"
            aria-label={event.title}
            style={{
              backgroundImage: `url(${event.imageUrl ?? "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"})`,
            }}
          />
          <div className="grid gap-8 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{event.category}</span>
                <span className="text-sm text-slate-500">{interestedCount} students interested</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">{event.title}</h1>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["College", event.college?.name ?? "Campus Event"],
                  ["Venue", event.venue],
                  ["Date", new Date(event.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })],
                  ["Time", event.time],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</dt>
                    <dd className="mt-2 font-semibold text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">Description</h2>
                <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-600">{event.description}</p>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Event attendance</h2>
                <div className="mt-4"><EventAttendanceButton eventId={id} /></div>
                {event.registrationUrl ? <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="mt-3 block rounded-full border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700">Register with organizer</a> : null}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-bold text-slate-900">Students attending</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {attendees.map((student) => (
                    <span key={student.id} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">{student.name}</span>
                  ))}
                  {attendees.length === 0 ? <p className="text-sm text-slate-500">No students have joined yet.</p> : null}
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>
    </div>
  );
}