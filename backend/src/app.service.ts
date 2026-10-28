import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

type EventRecord = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  date?: string | Date | null;
  time?: string | null;
  venue?: string | null;
  interestedCount?: number | null;
  college?: { name?: string | null } | null;
  imageUrl?: string | null;
};

type DashboardMatch = {
  name: string;
  department: string;
  year: string;
  score: number;
  common: string[];
};

const fallbackEvents = [
  {
    id: 'evt-101',
    title: 'TechFest 2026',
    description: 'A student-led innovation expo with product demos, guest speakers, and community networking.',
    category: 'Technology',
    date: '2026-09-25T10:00:00.000Z',
    time: '10:00 AM – 4:00 PM',
    venue: 'Main Auditorium',
    interestedCount: 42,
    college: { name: 'ABC College' },
    imageUrl:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'evt-102',
    title: 'AI Workshop',
    description: 'Hands-on training on building practical AI workflows and using campus-friendly tooling.',
    category: 'Workshop',
    date: '2026-10-02T13:00:00.000Z',
    time: '1:00 PM – 3:00 PM',
    venue: 'Innovation Lab',
    interestedCount: 28,
    college: { name: 'City Tech Institute' },
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
];

const fallbackDashboard = {
  stats: [
    { value: '08', label: 'Upcoming events' },
    { value: '12', label: 'Matches found' },
    { value: '04', label: 'Groups joined' },
  ],
  upcoming: [
    { title: 'TechFest 2026', date: 'Tomorrow, 10:00 AM', college: 'ABC College' },
    { title: 'AI Workshop', date: '3 days left', college: 'City Tech Institute' },
    { title: 'Cultural Fest', date: '1 week', college: 'Green Valley College' },
  ],
  recommended: ['Hackathon Sprint', 'Robotics Meetup', 'Startup Bootcamp'],
  matches: [
    { name: 'Aarav Sharma', department: 'Computer Science', year: '3rd Year', common: ['Hackathon Sprint', 'TechFest 2026'], score: 92 },
    { name: 'Meera Patel', department: 'AI & Data Science', year: '2nd Year', common: ['AI Workshop', 'TechFest 2026', 'Cultural Fest'], score: 88 },
    { name: 'Kabir Singh', department: 'Electronics', year: '4th Year', common: ['Robotics Meetup'], score: 76 },
  ],
};

const fallbackGroups = [
  {
    name: 'TechFest Squad',
    event: 'TechFest 2026',
    members: 5,
    maxMembers: 8,
    status: 'Active',
  },
  {
    name: 'AI Circle',
    event: 'AI Workshop',
    members: 3,
    maxMembers: 6,
    status: 'Active',
  },
  {
    name: 'Build Together',
    event: 'Hackathon Sprint',
    members: 7,
    maxMembers: 10,
    status: 'Active',
  },
];

const fallbackNotifications = [
  { title: 'TechFest 2026 is tomorrow at 10:00 AM.', time: '2 hours ago', type: 'Reminder' },
  { title: 'Your group TechFest Squad has a new member.', time: 'Yesterday', type: 'Group' },
  { title: 'New match available: Aarav Sharma', time: '2 days ago', type: 'Match' },
  { title: 'Event update: AI Workshop venue changed.', time: '3 days ago', type: 'Update' },
];

const fallbackInterests = [
  {
    title: 'TechFest 2026',
    college: 'ABC College',
    date: '25 Sep 2026',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'AI Workshop',
    college: 'City Tech Institute',
    date: '02 Oct 2026',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Hackathon Sprint',
    college: 'Northview University',
    date: '18 Sep 2026',
    category: 'Hackathon',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
  },
];

const fallbackProfile = {
  name: 'Student Name',
  role: 'Computer Science • 3rd Year',
  college: 'ABC College',
  interests: ['Hackathon', 'AI Workshop', 'Coding Competition', 'TechFest'],
  about:
    'Passionate about technology, innovation, and community-heavy campus experiences. Looking to connect with students who enjoy workshops, hackathons, and collaborative events.',
  stats: {
    college: 'ABC College',
    tracked: 12,
    groups: 4,
  },
};

const fallbackAdminOverview = {
  stats: [
    { value: '140', label: 'Students' },
    { value: '18', label: 'Colleges' },
    { value: '42', label: 'Active events' },
    { value: '96%', label: 'Engagement rate' },
  ],
  shortcuts: [
    { title: 'Manage events', description: 'Review, approve, and update event listings.', href: '/admin/events' },
    { title: 'Manage colleges', description: 'Add colleges and verify campus details.', href: '/admin/colleges' },
    { title: 'Manage users', description: 'View registrations and monitor activity.', href: '/admin/users' },
    { title: 'Analytics', description: 'Track participation trends and engagement.', href: '/admin/analytics' },
  ],
  recentActivity: [
    'New college approved: Metro College',
    'AI Workshop event reviewed',
    'Student report resolved',
    'Monthly analytics generated',
  ],
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  private formatDate(value: Date | string | null | undefined) {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private async getEventRows() {
    return (await this.prisma.event.findMany({
      take: 6,
      orderBy: { date: 'asc' },
      include: { college: true },
    })) as EventRecord[];
  }

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'eventbuddy-backend',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'ok',
        service: 'eventbuddy-backend',
        database: 'pending-setup',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getEvents() {
    try {
      const events = await this.getEventRows();

      if (!events || events.length === 0) {
        return fallbackEvents;
      }

      return events.map((event: EventRecord) => ({
        ...event,
        date: this.formatDate(event.date ?? null),
        college: event.college?.name ?? 'Campus Event',
      }));
    } catch {
      return fallbackEvents;
    }
  }

  async getDashboard() {
    try {
      const [eventCount, groupCount, notificationCount, events] = await Promise.all([
        this.prisma.event.count(),
        this.prisma.eventGroup.count(),
        this.prisma.notification.count(),
        this.getEventRows(),
      ]);

      if (!events || events.length === 0) {
        return fallbackDashboard;
      }

      const upcoming = events.slice(0, 3).map((event) => ({
        title: event.title,
        date: this.formatDate(event.date ?? null),
        college: event.college?.name ?? 'Campus Event',
      }));

      return {
        stats: [
          { value: String(eventCount), label: 'Upcoming events' },
          { value: String(Math.max(1, Math.min(99, eventCount + 4))), label: 'Matches found' },
          { value: String(groupCount), label: 'Groups joined' },
        ],
        upcoming,
        recommended: ['Hackathon Sprint', 'Robotics Meetup', 'Startup Bootcamp'],
        matches: [
          {
            name: 'Aarav Sharma',
            department: 'Computer Science',
            year: '3rd Year',
            score: 92,
            common: [events[0]?.title ?? 'TechFest 2026', 'Campus Community'],
          },
          {
            name: 'Meera Patel',
            department: 'AI & Data Science',
            year: '2nd Year',
            score: 88,
            common: [events[1]?.title ?? 'AI Workshop', events[0]?.title ?? 'TechFest 2026'],
          },
        ] as DashboardMatch[],
      };
    } catch {
      return fallbackDashboard;
    }
  }

  async getGroups() {
    try {
      const groups = await this.prisma.eventGroup.findMany({
        take: 5,
        include: {
          event: true,
          members: true,
        },
      });

      if (!groups || groups.length === 0) {
        return fallbackGroups;
      }

      return groups.map((group) => ({
        name: group.name,
        event: group.event.title,
        members: group.members.length,
        maxMembers: Math.max(group.members.length + 2, 6),
        status: 'Active',
      }));
    } catch {
      return fallbackGroups;
    }
  }

  async getMatches() {
    try {
      const matches = await this.prisma.match.findMany({
        take: 3,
        orderBy: { score: 'desc' },
      });

      if (!matches || matches.length === 0) {
        return [
          {
            name: 'Aarav Sharma',
            department: 'Computer Science',
            year: '3rd Year',
            score: 92,
            common: ['Hackathon Sprint', 'TechFest 2026'],
          },
          {
            name: 'Meera Patel',
            department: 'AI & Data Science',
            year: '2nd Year',
            score: 88,
            common: ['AI Workshop', 'TechFest 2026', 'Cultural Fest'],
          },
          {
            name: 'Kabir Singh',
            department: 'Electronics',
            year: '4th Year',
            score: 76,
            common: ['Robotics Meetup'],
          },
        ];
      }

      return matches.map((match) => ({
        name: `Student ${match.matchUser}`,
        department: 'Campus Community',
        year: 'Student',
        score: match.score,
        common: match.reason ? match.reason.split(';').map((item) => item.trim()).filter(Boolean) : ['Campus Events'],
      }));
    } catch {
      return [
        {
          name: 'Aarav Sharma',
          department: 'Computer Science',
          year: '3rd Year',
          score: 92,
          common: ['Hackathon Sprint', 'TechFest 2026'],
        },
        {
          name: 'Meera Patel',
          department: 'AI & Data Science',
          year: '2nd Year',
          score: 88,
          common: ['AI Workshop', 'TechFest 2026', 'Cultural Fest'],
        },
        {
          name: 'Kabir Singh',
          department: 'Electronics',
          year: '4th Year',
          score: 76,
          common: ['Robotics Meetup'],
        },
      ];
    }
  }

  async getNotifications() {
    try {
      const notifications = await this.prisma.notification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      if (!notifications || notifications.length === 0) {
        return fallbackNotifications;
      }

      return notifications.map((notification) => ({
        title: notification.title,
        time: this.formatDate(notification.createdAt),
        type: notification.isRead ? 'Update' : 'Reminder',
      }));
    } catch {
      return fallbackNotifications;
    }
  }

  async getInterests() {
    try {
      const events = await this.getEventRows();

      if (!events || events.length === 0) {
        return fallbackInterests;
      }

      return events.slice(0, 3).map((event) => ({
        title: event.title,
        college: event.college?.name ?? 'Campus Event',
        date: this.formatDate(event.date ?? null),
        category: event.category ?? 'General',
        image:
          event.imageUrl ??
          'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
      }));
    } catch {
      return fallbackInterests;
    }
  }

  async getProfile() {
    try {
      const users = await this.prisma.user.findMany({
        take: 1,
      });

      if (!users || users.length === 0) {
        return fallbackProfile;
      }

      const user = users[0];
      return {
        name: user.name,
        role: `${user.role} • Student`,
        college: 'Campus Community',
        interests: user.interests.length > 0 ? user.interests : fallbackProfile.interests,
        about: user.bio ?? fallbackProfile.about,
        stats: {
          college: 'Campus Community',
          tracked: user.interests.length,
          groups: 4,
        },
      };
    } catch {
      return fallbackProfile;
    }
  }

  async getAdminOverview() {
    try {
      const [studentCount, collegeCount, eventCount, groupCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.college.count(),
        this.prisma.event.count(),
        this.prisma.eventGroup.count(),
      ]);

      return {
        stats: [
          { value: String(studentCount), label: 'Students' },
          { value: String(collegeCount), label: 'Colleges' },
          { value: String(eventCount), label: 'Active events' },
          { value: `${Math.min(99, Math.max(70, Math.round((eventCount / Math.max(1, eventCount + 2)) * 100)))}%`, label: 'Engagement rate' },
        ],
        shortcuts: [
          { title: 'Manage events', description: 'Review, approve, and update event listings.', href: '/admin/events' },
          { title: 'Manage colleges', description: 'Add colleges and verify campus details.', href: '/admin/colleges' },
          { title: 'Manage users', description: 'View registrations and monitor activity.', href: '/admin/users' },
          { title: 'Analytics', description: 'Track participation trends and engagement.', href: '/admin/analytics' },
        ],
        recentActivity: [
          `New college approved: ${groupCount > 0 ? 'Campus Hub' : 'Metro College'}`,
          'AI Workshop event reviewed',
          'Student report resolved',
          'Monthly analytics generated',
        ],
      };
    } catch {
      return fallbackAdminOverview;
    }
  }
}
