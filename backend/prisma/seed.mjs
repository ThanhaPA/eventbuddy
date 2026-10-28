import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString('hex')}:${key.toString('hex')}`;
}

async function main() {
  const colleges = await Promise.all([
    prisma.college.upsert({
      where: { name: 'ABC College' },
      update: {},
      create: { name: 'ABC College', city: 'Bengaluru', state: 'Karnataka', country: 'India', description: 'Campus innovation community.', website: 'https://example.edu' },
    }),
    prisma.college.upsert({
      where: { name: 'City Tech Institute' },
      update: {},
      create: { name: 'City Tech Institute', city: 'Hyderabad', state: 'Telangana', country: 'India', description: 'Technology and design campus.', website: 'https://citytech.edu' },
    }),
    prisma.college.upsert({
      where: { name: 'Green Valley College' },
      update: {},
      create: { name: 'Green Valley College', city: 'Pune', state: 'Maharashtra', country: 'India', description: 'Arts, culture, and research campus.' },
    }),
  ]);

  const events = [
    {
      id: 'evt-techfest-2026',
      title: 'Campus TechFest',
      description: 'A student-led technology showcase with project demos, talks, and hands-on innovation challenges.',
      date: '2026-11-14T10:00:00.000Z', time: '10:00 AM – 4:00 PM', venue: 'Main Auditorium', category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80', collegeId: colleges[0].id,
    },
    {
      id: 'evt-ai-workshop',
      title: 'Practical AI Workshop',
      description: 'A beginner-friendly workshop exploring responsible, practical AI tools through guided campus projects.',
      date: '2026-11-21T13:00:00.000Z', time: '1:00 PM – 3:30 PM', venue: 'Innovation Lab', category: 'Workshop',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80', collegeId: colleges[1].id,
    },
    {
      id: 'evt-cultural-night',
      title: 'Intercollege Cultural Night',
      description: 'An evening of live music, dance, student art, and performances from neighboring campuses.',
      date: '2026-12-05T17:00:00.000Z', time: '5:00 PM – 9:00 PM', venue: 'Open Air Stage', category: 'Cultural',
      imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80', collegeId: colleges[2].id,
    },
    {
      id: 'evt-winter-hackathon',
      title: 'Winter Buildathon',
      description: 'Form a team, pick a campus challenge, and build a working prototype during this friendly hackathon.',
      date: '2026-12-12T09:00:00.000Z', time: '9:00 AM – 6:00 PM', venue: 'Engineering Block', category: 'Hackathon',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80', collegeId: colleges[0].id,
    },
    {
      id: 'evt-startup-forum',
      title: 'Student Startup Forum',
      description: 'Meet student founders, share early ideas, and hear practical lessons from local entrepreneurs.',
      date: '2027-01-16T11:00:00.000Z', time: '11:00 AM – 2:00 PM', venue: 'Business School Hall', category: 'Seminar',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80', collegeId: colleges[1].id,
    },
  ];

  for (const event of events) {
    const { date, ...fields } = event;
    await prisma.event.upsert({
      where: { id: event.id },
      update: { ...fields, date: new Date(date) },
      create: { ...fields, date: new Date(date) },
    });
  }

  const seedPassword = process.env.SEED_STUDENT_PASSWORD;
  if (seedPassword) {
    if (seedPassword.length < 12) throw new Error('SEED_STUDENT_PASSWORD must be at least 12 characters.');
    const student = await prisma.user.upsert({
      where: { email: 'student@eventbuddy.app' },
      update: { passwordHash: await hashPassword(seedPassword), isActive: true },
      create: {
        email: 'student@eventbuddy.app', name: 'Aarav Sharma', passwordHash: await hashPassword(seedPassword),
        role: 'student', bio: 'Interested in hackathons and startup culture.',
        interests: ['Hackathon', 'AI Workshop', 'TechFest'], collegeId: colleges[0].id,
      },
    });

    const group = await prisma.eventGroup.upsert({
      where: { id: 'grp-techfest-squad' },
      update: {},
      create: { id: 'grp-techfest-squad', name: 'TechFest Squad', eventId: 'evt-techfest-2026' },
    });
    await prisma.groupMember.upsert({
      where: { userId_groupId: { userId: student.id, groupId: group.id } },
      update: {},
      create: { userId: student.id, groupId: group.id, role: 'admin' },
    });
    await prisma.notification.upsert({
      where: { id: 'notif-techfest-1' },
      update: {},
      create: { id: 'notif-techfest-1', userId: student.id, title: 'Campus TechFest is coming up.', message: 'Make a plan with your event group.', isRead: false },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingAdmin) {
      await prisma.user.update({ where: { id: existingAdmin.id }, data: { role: 'admin', isActive: true } });
      console.log(`Granted admin access to existing account ${adminEmail}; its password was unchanged.`);
    } else {
      if (!adminPassword || adminPassword.length < 16) {
        throw new Error('For a new admin account, set SEED_ADMIN_PASSWORD to at least 16 characters.');
      }
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: process.env.SEED_ADMIN_NAME?.trim() || 'EventBuddy Admin',
          passwordHash: await hashPassword(adminPassword),
          role: 'admin',
          interests: [],
        },
      });
      console.log(`Created administrator account ${adminEmail}.`);
    }
  }

  console.log(`Seeded ${events.length} sample events across ${colleges.length} colleges.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });