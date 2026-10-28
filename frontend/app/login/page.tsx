"use client";

import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EVENTBUDDY_API_URL ?? "http://localhost:4000"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not sign in.");
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not connect to EventBuddy.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Home" />

      <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-lg lg:grid-cols-2">
          <div className="relative hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 p-8 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_25%)]" />
            <div className="relative z-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl font-black backdrop-blur-sm">
                E
              </div>
              <h1 className="text-4xl font-black tracking-tight">Welcome back</h1>
              <p className="mt-4 max-w-sm text-base text-violet-100/90">
                Discover events, meet students with similar interests, and stay connected to your campus community.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Login</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Sign in to EventBuddy</h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@college.edu"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                  Remember me
                </label>
              </div>

              {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}

              <button disabled={submitting} className="w-full rounded-full bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
                {submitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account? {" "}
              <a href="/register" className="font-semibold text-violet-700">
                Create one
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
