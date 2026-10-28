import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('colleges')
export class CollegesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.college.findMany({
      select: { id: true, name: true, city: true, state: true, country: true },
      orderBy: { name: 'asc' },
    });
  }
}