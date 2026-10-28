"use client";

import { useEffect, useState } from "react";
import { EventBuddyNav, SectionHeading } from "@/components/eventbuddy-ui";
import { connectWithUser, getIncomingConnections, getMatchesData, respondToConnection } from "@/lib/eventbuddy-api";

type Match = { id: string; name: string; department: string; score: number; common: string[]; connectionStatus: string | null };
type IncomingRequest = { id: string; requester: { id: string; name: string }; createdAt: string };

export default function DashboardMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState("");
  const [requests, setRequests] = useState<IncomingRequest[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([getMatchesData(), getIncomingConnections()])
      .then(([data, incoming]: [Match[], IncomingRequest[]]) => {
        if (active) {
          setMatches(data);
          setRequests(incoming);
        }
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load matches."); });
    return () => { active = false; };
  }, []);

  async function connect(id: string) {
    setConnecting(id);
    try {
      await connectWithUser(id);
      setMatches((items) => items.map((item) => item.id === id ? { ...item, connectionStatus: "pending" } : item));
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Could not send connection request.");
    } finally {
      setConnecting("");
    }
  }

  async function respond(requestId: string, decision: 'accepted' | 'declined') {
    try {
      await respondToConnection(requestId, decision);
      setRequests((items) => items.filter((item) => item.id !== requestId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update request.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Matches" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Connections" title="Students with shared interests" />
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        {requests.length > 0 ? <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold">Incoming requests</h2>
          <div className="space-y-3">{requests.map((request) => <article key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">{request.requester.name} wants to connect</p>
            <div className="flex gap-2">
              <button onClick={() => void respond(request.id, 'accepted')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Accept</button>
              <button onClick={() => void respond(request.id, 'declined')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">Decline</button>
            </div>
          </article>)}</div>
        </section> : null}
        <div className="space-y-5">
          {matches.map((match) => (
            <article key={match.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">{match.name.charAt(0)}</div>
                  <div><h2 className="text-lg font-bold">{match.name}</h2><p className="text-sm text-slate-600">{match.department}</p></div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">Interest match: {match.score}%</span>
              </div>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shared interests</p>
                <p className="mt-2 text-sm text-slate-700">{match.common.join(", ") || "Same college"}</p>
              </div>
              <button disabled={Boolean(match.connectionStatus) || connecting === match.id} onClick={() => void connect(match.id)} className="mt-5 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {match.connectionStatus ? `Request ${match.connectionStatus}` : connecting === match.id ? "Sending..." : "Connect"}
              </button>
            </article>
          ))}
          {!error && matches.length === 0 ? <p className="py-12 text-center text-sm text-slate-600">No matches yet. Add interests to your profile to find students with similar interests.</p> : null}
        </div>
      </main>
    </div>
  );
}