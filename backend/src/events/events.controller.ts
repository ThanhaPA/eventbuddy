import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { EventsService } from './events.service.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService, private readonly authService: AuthService) {}

  @Get()
  list(@Query('search') search?: string, @Query('category') category?: string) {
    return this.eventsService.list(search, category);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.eventsService.getById(id);
  }

  @Post(':id/view')
  recordView(@Param('id') id: string) {
    return this.eventsService.recordView(id);
  }

  @Post(':id/attendance')
  async toggleAttendance(@Param('id') id: string, @Req() request: Request) {
    const user = await this.requireUser(request);
    return this.eventsService.toggleAttendance(id, user.id);
  }

  @Post()
  async create(@Body() body: Record<string, unknown>, @Req() request: Request) {
    await this.requireAdmin(request);
    return this.eventsService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: Request) {
    await this.requireAdmin(request);
    return this.eventsService.update(id, body);
  }

  private async requireUser(request: Request) {
    const token = this.readSession(request);
    if (!token) throw new UnauthorizedException('Sign in to continue');
    return this.authService.authenticate(token);
  }

  private async requireAdmin(request: Request) {
    if ((await this.requireUser(request)).role !== 'admin') throw new ForbiddenException('Administrator access required');
  }

  private readSession(request: Request) {
    return request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('eventbuddy_session='))
      ?.slice('eventbuddy_session='.length);
  }
}