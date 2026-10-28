"use client";

import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getColleges } from "@/lib/eventbuddy-api";

type College = { id: string; name: string; city: string };

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);

  useEffect(() => {
    let active = true;
    getColleges()
      .then((items) => { if (active) setColleges(items); })
      .catch(() => { if (active) setColleges([]); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    if (!formData.has("agreeTerms")) {
      setError("Please accept the terms and privacy policy.");
      setSubmitting(false);
      return;
    }
    if (password !== formData.get("confirmPassword")) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EVENTBUDDY_API_URL ?? "http://localhost:4000"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), password, collegeId: formData.get("collegeId") || undefined }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(Array.isArray(payload.message) ? payload.message.join(" ") : payload.message ?? "Could not create your account.");
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

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg sm:p-8 lg:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Register</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Create your EventBuddy profile</h1>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input name="name" required minLength={2} maxLength={100} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white" placeholder="Student name" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white" placeholder="you@college.edu" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">College (optional)</label>
              <select name="collegeId" defaultValue="" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <option value="">Choose later</option>
                {colleges.map((college) => <option key={college.id} value={college.id}>{college.name} · {college.city}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input name="password" type="password" required minLength={12} autoComplete="new-password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white" placeholder="Create password (12+ characters)" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
              <input name="confirmPassword" type="password" required minLength={12} autoComplete="new-password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white" placeholder="Re-enter password" />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 text-sm text-slate-600">
              <input name="agreeTerms" type="checkbox" required className="h-4 w-4 rounded border-slate-300 text-violet-600" />
              I agree to the terms and privacy policy.
            </div>

            {error ? <p role="alert" className="md:col-span-2 text-sm text-red-700">{error}</p> : null}

            <button disabled={submitting} className="md:col-span-2 w-full rounded-full bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? {" "}
            <a href="/login" className="font-semibold text-violet-700">Login</a>
          </p>
        </div>
      </main>
    </div>
  );
}
