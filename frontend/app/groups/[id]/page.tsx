"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { getGroupById, sendGroupMessage } from "@/lib/eventbuddy-api";

type GroupDetails = {
  id: string;
  name: string;
  event: { title: string };
  members: { userId: string; user: { id: string; name: string } }[];
  messages: { id: string; text: string; createdAt: string; user: { id: string; name: string } }[];
};

export default function GroupDetailsPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function reload() {
    try {
      setGroup(await getGroupById(groupId) as GroupDetails);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this group.");
    }
  }

  useEffect(() => {
    let active = true;
    getGroupById(groupId)
      .then((data) => {
        if (active) setGroup(data as GroupDetails);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load this group.");
      });
    return () => { active = false; };
  }, [groupId]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    try {
      await sendGroupMessage(groupId, message);
      setMessage("");
      await reload();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Groups" />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        {!group && !error ? <p className="py-10 text-center text-sm text-slate-600">Loading group...</p> : null}
        {group ? (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Group discussion</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{group.name}</h1>
              <p className="mt-2 text-sm text-slate-600">Event: {group.event.title} · {group.members.length} members</p>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {group.members.map((member) => <span key={member.user.id} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">{member.user.name}</span>)}
            </div>
            <div className="max-h-[55vh] space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4">
              {group.messages.map((item) => (
                <article key={item.id} className="max-w-xl rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-violet-700">{item.user.name}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{item.text}</p>
                  <time className="mt-2 block text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</time>
                </article>
              ))}
              {group.messages.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No messages yet.</p> : null}
            </div>
            <form onSubmit={submitMessage} className="mt-4 flex gap-3">
              <input required maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} aria-label="Message" placeholder="Write a message" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm" />
              <button disabled={sending} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{sending ? "Sending..." : "Send"}</button>
            </form>
          </section>
        ) : null}
      </main>
    </div>
  );
}