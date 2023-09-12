import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'nestjs-prisma';
import { UsersModule } from './users/users.module';
import { CoffeesModule } from './coffees/coffees.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [PrismaModule.forRoot(), UsersModule, CoffeesModule, IamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
