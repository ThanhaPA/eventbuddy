import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type EventRecord = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  date?: Date | string | null;
  time?: string | null;
  venue?: string | null;
  interestedCount?: number | null;
  imageUrl?: string | null;
  registrationUrl?: string | null;
  college?: { name?: string | null } | null;
  attendees?: { id: string }[];
  _count?: { attendees: number };
};

type CollegeRecord = {
  id: string;
  name: string;
  city: string;
  state?: string | null;
  country: string;
  description?: string | null;
  website?: string | null;
};

type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  interests: string[];
  passwordHash: string | null;
  isActive: boolean;
  bio?: string | null;
  collegeId?: string | null;
  college?: { name: string } | null;
  attendingEvents?: EventRecord[];
  groupMemberships?: GroupMemberRecord[];
  _count?: { groupMemberships: number; attendingEvents: number };
};

type GroupRecord = {
  id: string;
  name: string;
  eventId: string;
  event: { title: string };
  members: { userId: string; role?: string }[];
  messages?: { id: string; text: string; createdAt: Date | string; user: { id: string; name: string } }[];
};

type GroupMemberRecord = {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  group?: GroupRecord;
};

type GroupMessageRecord = {
  id: string;
  groupId: string;
  userId: string;
  text: string;
  createdAt: Date | string;
  user?: { id: string; name: string };
};

type MatchRecord = {
  matchUser: string;
  score: number;
  reason?: string | null;
};

type ConnectionRecord = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: string;
  requester?: { id: string; name: string };
  receiver?: { id: string; name: string };
};

type EventViewRecord = { id: string; eventId: string; viewedAt: Date | string };

type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  message?: string;
  createdAt: Date | string;
  isRead: boolean;
};

type CrudCollection<T = Record<string, unknown>> = {
  findMany: (args?: Record<string, unknown>) => Promise<T[]>;
  findFirst?: (args?: Record<string, unknown>) => Promise<T | null>;
  findUnique?: (args?: Record<string, unknown>) => Promise<T | null>;
  create?: (args: Record<string, unknown>) => Promise<T>;
  update?: (args: Record<string, unknown>) => Promise<T>;
  updateMany?: (args: Record<string, unknown>) => Promise<{ count: number }>;
  deleteMany?: (args: Record<string, unknown>) => Promise<{ count: number }>;
  count: (args?: Record<string, unknown>) => Promise<number>;
};

type PrismaClientLike = {
  event: CrudCollection<EventRecord>;
  college: CrudCollection<CollegeRecord>;
  user: CrudCollection<UserRecord>;
  notification: CrudCollection<NotificationRecord>;
  eventGroup: CrudCollection<GroupRecord>;
  groupMember: CrudCollection<GroupMemberRecord>;
  groupMessage: CrudCollection<GroupMessageRecord>;
  match: CrudCollection<MatchRecord>;
  connection: CrudCollection<ConnectionRecord>;
  eventView: CrudCollection<EventViewRecord>;
  $queryRaw: (...args: unknown[]) => Promise<unknown>;
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
};

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClientLike;

  constructor() {
    this.client = this.createClient();
  }

  private createClient(): PrismaClientLike {
    return new PrismaClient() as unknown as PrismaClientLike;
  }

  get event() {
    return this.client.event;
  }

  get college() {
    return this.client.college;
  }

  get user() {
    return this.client.user;
  }

  get notification() {
    return this.client.notification;
  }

  get eventGroup() {
    return this.client.eventGroup;
  }

  get groupMember() {
    return this.client.groupMember;
  }

  get groupMessage() {
    return this.client.groupMessage;
  }

  get match() {
    return this.client.match;
  }

  get connection() {
    return this.client.connection;
  }

  get eventView() {
    return this.client.eventView;
  }

  async $queryRaw(...args: unknown[]) {
    return this.client.$queryRaw(...args);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
