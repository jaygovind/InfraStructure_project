
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
 profile(@Request() req: ExpressRequest) {
   const user = req.user as { email?: string; userId?: string };
   const email = user && user.email ? user.email : null;
   return { userId: user && user.userId ? user.userId : null, email };
 }
}
