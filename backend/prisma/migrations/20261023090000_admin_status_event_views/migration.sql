ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Event" ADD COLUMN "registrationUrl" TEXT;

ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

CREATE TABLE "EventView" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventView_eventId_viewedAt_idx" ON "EventView"("eventId", "viewedAt");

CREATE UNIQUE INDEX "GroupMember_userId_groupId_key" ON "GroupMember"("userId", "groupId");

ALTER TABLE "EventView"
ADD CONSTRAINT "EventView_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;