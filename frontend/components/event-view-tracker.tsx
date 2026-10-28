"use client";

import { useEffect } from "react";
import { recordEventView } from "@/lib/eventbuddy-api";

export function EventViewTracker({ eventId }: { eventId: string }) {
  useEffect(() => {
    const key = `eventbuddy-view:${eventId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "recorded");
    void recordEventView(eventId);
  }, [eventId]);

  return null;
}