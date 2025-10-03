
import { Controller, Get, Res } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Registry, collectDefaultMetrics } from 'prom-client';
import type { Response } from 'express';
import { PrismaService } from '../prisma.service';

const register = new Registry();
collectDefaultMetrics({ register });

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'backend' };
  }

  @Get('error')
  getError() {
    try {
      throw new Error('Test error');
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  }

  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany();
  }
}
