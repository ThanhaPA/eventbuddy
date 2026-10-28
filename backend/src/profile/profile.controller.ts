import { Body, Controller, Get, Patch, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { ProfileService } from './profile.service.js';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private readonly authService: AuthService) {}

  @Get()
  async get(@Req() request: Request) {
    return this.profileService.get(await this.currentUserId(request));
  }

  @Patch()
  async update(@Req() request: Request, @Body() body: { name?: unknown; bio?: unknown; interests?: unknown; collegeId?: unknown }) {
    return this.profileService.update(await this.currentUserId(request), body);
  }

  private async currentUserId(request: Request) {
    const token = request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('eventbuddy_session='))
      ?.slice('eventbuddy_session='.length);
    if (!token) throw new UnauthorizedException('Sign in to continue');
    return (await this.authService.authenticate(token)).id;
  }
}