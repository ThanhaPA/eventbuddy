"use client";

import { useState } from "react";
import { setEventAttendance } from "@/lib/eventbuddy-api";

export function EventAttendanceButton({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function toggleAttendance() {
    setSubmitting(true);
    setMessage("");
    try {
      await setEventAttendance(eventId);
      setMessage("Your attendance was updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update attendance.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button onClick={toggleAttendance} disabled={submitting} className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
        {submitting ? "Updating..." : "I’m Interested"}
      </button>
      {message ? <p role="status" className="mt-2 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}