import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthencicationController } from './authencication/authencication.controller';
import { AuthencicationService } from './authencication/authencication.service';
import { PrismaService } from 'nestjs-prisma';

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    AuthencicationService,
    PrismaService,
  ],
  controllers: [AuthencicationController],
})
export class IamModule {}
