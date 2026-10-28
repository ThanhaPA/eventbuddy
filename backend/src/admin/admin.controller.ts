import { Body, Controller, Get, Param, Patch, Post, Req, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { EventsService } from '../events/events.service.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService, private readonly eventsService: EventsService, private readonly auth: AuthService) {}

  @Get('overview')
  async overview(@Req() request: Request) { await this.requireAdmin(request); return this.adminService.overview(); }

  @Get('events')
  async events(@Req() request: Request) { await this.requireAdmin(request); return this.adminService.listEvents(); }

  @Post('events')
  async createEvent(@Req() request: Request, @Body() body: Record<string, unknown>) { await this.requireAdmin(request); return this.eventsService.create(body); }

  @Patch('events/:id')
  async updateEvent(@Req() request: Request, @Param('id') id: string, @Body() body: Record<string, unknown>) { await this.requireAdmin(request); return this.eventsService.update(id, body); }

  @Get('colleges')
  async colleges(@Req() request: Request) { await this.requireAdmin(request); return this.adminService.listColleges(); }

  @Post('colleges')
  async createCollege(@Req() request: Request, @Body() body: Record<string, unknown>) { await this.requireAdmin(request); return this.adminService.createCollege(body); }

  @Patch('colleges/:id')
  async updateCollege(@Req() request: Request, @Param('id') id: string, @Body() body: Record<string, unknown>) { await this.requireAdmin(request); return this.adminService.updateCollege(id, body); }

  @Get('users')
  async users(@Req() request: Request) { await this.requireAdmin(request); return this.adminService.listUsers(); }

  @Patch('users/:id/status')
  async setUserStatus(@Req() request: Request, @Param('id') id: string, @Body() body: { isActive?: unknown }) {
    await this.requireAdmin(request);
    return this.adminService.setUserActive(id, body.isActive);
  }

  @Get('analytics')
  async analytics(@Req() request: Request) { await this.requireAdmin(request); return this.adminService.overview(); }

  private async requireAdmin(request: Request) {
    const token = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('eventbuddy_session='))?.slice('eventbuddy_session='.length);
    if (!token) throw new UnauthorizedException('Administrator access required');
    if ((await this.auth.authenticate(token)).role !== 'admin') throw new ForbiddenException('Administrator access required');
  }
}