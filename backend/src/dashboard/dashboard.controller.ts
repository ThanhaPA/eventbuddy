import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { DashboardService } from './dashboard.service.js';

@Controller()
export class DashboardController {
  constructor(private readonly dashboard: DashboardService, private readonly auth: AuthService) {}

  @Get('dashboard')
  async get(@Req() request: Request) {
    return this.dashboard.get(await this.currentUserId(request));
  }

  @Get('dashboard/interests')
  async interests(@Req() request: Request) {
    return this.dashboard.interests(await this.currentUserId(request));
  }

  private async currentUserId(request: Request) {
    const token = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('eventbuddy_session='))?.slice('eventbuddy_session='.length);
    if (!token) throw new UnauthorizedException('Sign in to continue');
    return (await this.auth.authenticate(token)).id;
  }
}