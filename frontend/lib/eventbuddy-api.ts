export type EventCardData = {
  id: string;
  title: string;
  college: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  interested: number;
  image: string;
};

const apiBase = process.env.NEXT_PUBLIC_EVENTBUDDY_API_URL ?? 'http://localhost:4000';

function normalizeEvent(event: Record<string, unknown>): EventCardData {
  const collegeName = typeof event.college === 'string' ? event.college : (event.college as { name?: string } | null)?.name ?? 'Campus Event';

  return {
    id: String(event.id ?? crypto.randomUUID()),
    title: String(event.title ?? 'Untitled Event'),
    college: String(collegeName),
    date: event.date ? new Date(String(event.date)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD',
    time: String(event.time ?? 'TBD'),
    venue: String(event.venue ?? 'Campus Hub'),
    category: String(event.category ?? 'General'),
    interested: Number(event.interestedCount ?? event.interested ?? 0),
    image: String(event.imageUrl ?? 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80'),
  };
}

export async function getEvents(): Promise<EventCardData[]> {
  const response = await fetch(`${apiBase}/events`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load events. Please try again.');
  const payload = await response.json();
  const data: Record<string, unknown>[] = Array.isArray(payload)
    ? (payload as Record<string, unknown>[])
    : ((payload.events ?? []) as Record<string, unknown>[]);
  return data.map((event: Record<string, unknown>) => normalizeEvent(event));
}

export async function searchEvents({ search = '', category = 'All' }: { search?: string; category?: string } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (category !== 'All') params.set('category', category);
  const suffix = params.size ? `?${params.toString()}` : '';
  const response = await fetch(`${apiBase}/events${suffix}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load events. Please try again.');
  const payload = (await response.json()) as Record<string, unknown>[];
  return payload.map((event) => normalizeEvent(event));
}

export async function setEventAttendance(eventId: string) {
  const response = await fetch(`${apiBase}/events/${encodeURIComponent(eventId)}/attendance`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { message?: string }).message ?? 'Could not update event attendance.');
  }
  return response.json();
}

export async function getEventById(id: string) {
  const response = await fetch(`${apiBase}/events/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(response.status === 404 ? 'Event not found.' : 'Could not load this event.');
  return response.json();
}

export async function recordEventView(id: string) {
  await fetch(`${apiBase}/events/${encodeURIComponent(id)}/view`, { method: 'POST' });
}

export async function getColleges() {
  const response = await fetch(`${apiBase}/colleges`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load colleges.');
  return response.json() as Promise<{ id: string; name: string; city: string }[]>;
}

async function authenticatedRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload as { message?: string }).message ?? 'Request failed.';
    throw new Error(response.status === 401 ? 'Sign in to use this feature.' : message);
  }
  return payload;
}

export async function createGroup(name: string, eventId: string) {
  return authenticatedRequest('/groups', { method: 'POST', body: JSON.stringify({ name, eventId }) });
}

export async function joinGroup(groupId: string) {
  return authenticatedRequest(`/groups/${encodeURIComponent(groupId)}/join`, { method: 'POST' });
}

export async function getDiscoverableGroups() {
  return authenticatedRequest('/groups/discover') as Promise<{
    id: string;
    name: string;
    eventId: string;
    event: { title: string };
    members: unknown[];
  }[]>;
}

export async function leaveGroup(groupId: string) {
  return authenticatedRequest(`/groups/${encodeURIComponent(groupId)}/leave`, { method: 'POST' });
}

export async function getGroupById(groupId: string) {
  return authenticatedRequest(`/groups/${encodeURIComponent(groupId)}`);
}

export async function sendGroupMessage(groupId: string, text: string) {
  return authenticatedRequest(`/groups/${encodeURIComponent(groupId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function getDashboardData() {
  return authenticatedRequest('/dashboard');
}

export async function getMatchesData() {
  return authenticatedRequest('/dashboard/matches');
}

export async function connectWithUser(userId: string) {
  return authenticatedRequest(`/dashboard/matches/${encodeURIComponent(userId)}/connect`, { method: 'POST' });
}

export async function getIncomingConnections() {
  return authenticatedRequest('/dashboard/matches/requests/incoming');
}

export async function respondToConnection(requestId: string, decision: 'accepted' | 'declined') {
  return authenticatedRequest(`/dashboard/matches/requests/${encodeURIComponent(requestId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ decision }),
  });
}

export async function getNotificationsData() {
  return authenticatedRequest('/dashboard/notifications');
}

export async function markAllNotificationsRead() {
  return authenticatedRequest('/dashboard/notifications/read', { method: 'PATCH' });
}

export async function markNotificationRead(id: string) {
  return authenticatedRequest(`/dashboard/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
}

export async function getInterestsData() {
  return authenticatedRequest('/dashboard/interests');
}

export async function getProfileData() {
  return authenticatedRequest('/profile');
}

export async function updateProfileData(profile: { name: string; bio: string; interests: string[]; collegeId: string | null }) {
  return authenticatedRequest('/profile', { method: 'PATCH', body: JSON.stringify(profile) });
}

export async function getAdminOverviewData() {
  return authenticatedRequest('/admin/overview');
}

export async function getAdminEvents() {
  return authenticatedRequest('/admin/events');
}

export async function getAdminColleges() {
  return authenticatedRequest('/admin/colleges');
}

export async function getAdminUsers() {
  return authenticatedRequest('/admin/users');
}

export async function setAdminUserActive(userId: string, isActive: boolean) {
  return authenticatedRequest(`/admin/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export async function createAdminEvent(event: Record<string, unknown>) {
  return authenticatedRequest('/admin/events', { method: 'POST', body: JSON.stringify(event) });
}

export async function updateAdminEvent(id: string, event: Record<string, unknown>) {
  return authenticatedRequest(`/admin/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(event) });
}

export async function createAdminCollege(college: Record<string, unknown>) {
  return authenticatedRequest('/admin/colleges', { method: 'POST', body: JSON.stringify(college) });
}

export async function updateAdminCollege(id: string, college: Record<string, unknown>) {
  return authenticatedRequest(`/admin/colleges/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(college) });
}

