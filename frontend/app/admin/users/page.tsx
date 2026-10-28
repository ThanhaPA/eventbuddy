"use client";

import { useEffect, useState } from "react";
import { EventBuddyNav } from "@/components/eventbuddy-ui";
import { getAdminUsers, setAdminUserActive } from "@/lib/eventbuddy-api";

type AdminUser = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; college?: { name: string } | null };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");

  async function toggleStatus(user: AdminUser) {
    try {
      await setAdminUserActive(user.id, !user.isActive);
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, isActive: !item.isActive } : item));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update account status.");
    }
  }

  useEffect(() => {
    let active = true;
    getAdminUsers()
      .then((data: AdminUser[]) => { if (active) setUsers(data); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Admin access required."); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EventBuddyNav active="Admin" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Manage users</h1>
        {error ? <p role="alert" className="mb-5 text-sm text-red-700">{error}</p> : null}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">College</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 font-semibold">{user.name}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{user.role}</td><td className="px-5 py-4">{user.college?.name ?? "Not set"}</td><td className="px-5 py-4">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-5 py-4">{user.isActive ? "Active" : "Suspended"}</td><td className="px-5 py-4"><button onClick={() => void toggleStatus(user)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">{user.isActive ? "Suspend" : "Reactivate"}</button></td></tr>)}</tbody>
          </table>
          {!error && users.length === 0 ? <p className="p-8 text-center text-sm text-slate-600">No users found.</p> : null}
        </div>
      </main>
    </div>
  );
}