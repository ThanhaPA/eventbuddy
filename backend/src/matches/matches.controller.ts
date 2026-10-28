import { Body, Controller, Get, Param, Patch, Post, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { MatchesService } from './matches.service.js';

@Controller('dashboard/matches')
export class MatchesController {
  constructor(private readonly service: MatchesService, private readonly auth: AuthService) {}

  @Get()
  async list(@Req() request: Request) {
    return this.service.list(await this.currentUserId(request));
  }

  @Post(':userId/connect')
  async connect(@Req() request: Request, @Param('userId') userId: string) {
    return this.service.connect(await this.currentUserId(request), userId);
  }

  @Get('requests/incoming')
  async incoming(@Req() request: Request) {
    return this.service.incoming(await this.currentUserId(request));
  }

  @Patch('requests/:requestId')
  async respond(@Req() request: Request, @Param('requestId') requestId: string, @Body() body: { decision?: unknown }) {
    if (body.decision !== 'accepted' && body.decision !== 'declined') {
      throw new BadRequestException('Decision must be accepted or declined');
    }
    return this.service.respond(await this.currentUserId(request), requestId, body.decision);
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