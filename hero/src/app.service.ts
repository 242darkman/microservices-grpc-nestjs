/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Hero } from './stubs/hero/v1alpha/hero';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';


interface FightRequest {
  id: number;
  id2: number;
}

interface FightResponse {
  message: string;
}


@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  create(data: Prisma.HeroCreateInput): Promise<Hero> {
    return this.prisma.hero.create({ data });
  }

  findAll(): Promise<Hero[]> {
    return this.prisma.hero.findMany();
  }

  findById(id: number): Promise<Hero> {
    return this.prisma.hero.findUnique({
      where: { id },
    });
  }

  findByName(name: string): Promise<Hero> {
    return this.prisma.hero.findUnique({
      where: { name },
    });
  }

  async update(id: number, data: Prisma.HeroUpdateInput): Promise<Hero> {
    return this.prisma.hero.update({
      where: { id },
      data,
    });
  }

  delete(id: number): Promise<Hero> {
    return this.prisma.hero.delete({
      where: { id },
    });
  }

  async fight(request: FightRequest): Promise<FightResponse> {
    if (!request.id || !request.id2) {
      return {
        message: 'Both heroes must exist to fight.',
      };
    }
    const hero1 = await this.findById(request.id);
    const hero2 = await this.findById(request.id2);
    const powerHero1 = hero1.hp * hero1.power;
    const powerHero2 = hero2.hp * hero2.power;
    const fightWinner = powerHero1 > powerHero2 ? hero1 : hero2;
    const fightLoser = powerHero1 < powerHero2 ? hero1 : hero2;

    return {
        message: `${fightWinner.name} win is fight against ${fightLoser.name}`,
    };
  }
}
