import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthencicationController } from './authencication/authencication.controller';
import { AuthencicationService } from './authencication/authencication.service';
import { PrismaService } from 'nestjs-prisma';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
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
