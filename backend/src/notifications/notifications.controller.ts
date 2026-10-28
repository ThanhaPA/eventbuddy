import { Controller, Get, Param, Patch, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { NotificationsService } from './notifications.service.js';

@Controller('dashboard/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService, private readonly auth: AuthService) {}

  @Get()
  async list(@Req() request: Request) {
    return this.service.list(await this.currentUserId(request));
  }

  @Patch('read')
  async markAllRead(@Req() request: Request) {
    return this.service.markAllRead(await this.currentUserId(request));
  }

  @Patch(':id/read')
  async markRead(@Req() request: Request, @Param('id') id: string) {
    return this.service.markRead(await this.currentUserId(request), id);
  }

  private async currentUserId(request: Request) {
    const token = request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('eventbuddy_session='))
      ?.slice('eventbuddy_session='.length);
    if (!token) throw new UnauthorizedException('Sign in to continue');
    return (await this.auth.authenticate(token)).id;
  }
}