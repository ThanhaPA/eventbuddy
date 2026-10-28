import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { EventsController } from './events/events.controller.js';
import { EventsService } from './events/events.service.js';
import { GroupsController } from './groups/groups.controller.js';
import { GroupsService } from './groups/groups.service.js';
import { ProfileController } from './profile/profile.controller.js';
import { ProfileService } from './profile/profile.service.js';
import { NotificationsController } from './notifications/notifications.controller.js';
import { NotificationsService } from './notifications/notifications.service.js';
import { MatchesController } from './matches/matches.controller.js';
import { MatchesService } from './matches/matches.service.js';
import { AdminController } from './admin/admin.controller.js';
import { AdminService } from './admin/admin.service.js';
import { DashboardController } from './dashboard/dashboard.controller.js';
import { DashboardService } from './dashboard/dashboard.service.js';
import { CollegesController } from './colleges/colleges.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, AuthController, EventsController, GroupsController, ProfileController, NotificationsController, MatchesController, AdminController, DashboardController, CollegesController],
  providers: [AppService, AuthService, EventsService, GroupsService, ProfileService, NotificationsService, MatchesService, AdminService, DashboardService],
})
export class AppModule {}
