import { Body, Controller, Get, Param, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { GroupsService } from './groups.service.js';

@Controller()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService, private readonly authService: AuthService) {}

  @Get('dashboard/groups')
  async list(@Req() request: Request) {
    return this.groupsService.listForUser((await this.currentUser(request)).id);
  }

  @Get('groups/discover')
  async discover(@Req() request: Request) {
    return this.groupsService.listAvailableForUser((await this.currentUser(request)).id);
  }

  @Post('groups')
  async create(@Req() request: Request, @Body() body: { name?: unknown; eventId?: unknown }) {
    return this.groupsService.create((await this.currentUser(request)).id, body.name, body.eventId);
  }

  @Post('groups/:id/join')
  async join(@Req() request: Request, @Param('id') groupId: string) {
    return this.groupsService.join((await this.currentUser(request)).id, groupId);
  }

  @Post('groups/:id/leave')
  async leave(@Req() request: Request, @Param('id') groupId: string) {
    return this.groupsService.leave((await this.currentUser(request)).id, groupId);
  }

  @Get('groups/:id')
  async getDetails(@Req() request: Request, @Param('id') groupId: string) {
    return this.groupsService.getDetails((await this.currentUser(request)).id, groupId);
  }

  @Post('groups/:id/messages')
  async sendMessage(@Req() request: Request, @Param('id') groupId: string, @Body() body: { text?: unknown }) {
    return this.groupsService.sendMessage((await this.currentUser(request)).id, groupId, body.text);
  }

  private async currentUser(request: Request) {
    const token = request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('eventbuddy_session='))
      ?.slice('eventbuddy_session='.length);
    if (!token) throw new UnauthorizedException('Sign in to continue');
    return this.authService.authenticate(token);
  }
}