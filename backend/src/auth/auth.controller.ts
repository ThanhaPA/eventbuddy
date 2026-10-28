import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

const sessionCookie = 'eventbuddy_session';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email?: unknown; name?: unknown; password?: unknown; collegeId?: unknown }, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(body);
    this.setSessionCookie(response, result.token);
    return result.user;
  }

  @Post('login')
  async login(@Body() body: { email?: unknown; password?: unknown }, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(body);
    this.setSessionCookie(response, result.token);
    return result.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(sessionCookie, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    return { status: 'ok' };
  }

  @Get('me')
  async getCurrentUser(@Req() request: Request) {
    const token = this.readCookie(request, sessionCookie);
    if (!token) throw new UnauthorizedException('Sign in to continue');
    return this.authService.authenticate(token);
  }

  private setSessionCookie(response: Response, token: string) {
    response.cookie(sessionCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private readCookie(request: Request, cookieName: string) {
    const prefix = `${cookieName}=`;
    return request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix))
      ?.slice(prefix.length);
  }
}