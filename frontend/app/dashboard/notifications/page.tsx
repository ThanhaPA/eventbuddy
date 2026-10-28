"use client";

import { useEffect, useState } from "react";
import { EventBuddyNav, SectionHeading } from "@/components/eventbuddy-ui";
import { getNotificationsData, markAllNotificationsRead, markNotificationRead } from "@/lib/eventbuddy-api";

type Notification = { id: string; title: string; message: string; isRead: boolean; createdAt: string };

export default function DashboardNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getNotificationsData()
      .then((data: Notification[]) => { if (active) setNotifications(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load notifications."); });
    return () => { active = false; };
  }, []);

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Could not update notifications.");
    }
  }

  async function markRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Could not update notification.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Groups" />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading eyebrow="Alerts" title="Notifications" />
          <button onClick={() => void markAllRead()} className="mb-6 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium">Mark all read</button>
        </div>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        <div className="space-y-4">
          {notifications.map((item) => (
            <article key={item.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${item.isRead ? "border-slate-200" : "border-violet-300"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <time className="mt-2 block text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</time>
                </div>
                {!item.isRead ? <button onClick={() => void markRead(item.id)} className="shrink-0 text-sm font-medium text-violet-700">Mark read</button> : <span className="text-xs text-slate-500">Read</span>}
              </div>
            </article>
          ))}
          {!error && notifications.length === 0 ? <p className="py-12 text-center text-sm text-slate-600">No notifications.</p> : null}
        </div>
      </main>
    </div>
  );
}