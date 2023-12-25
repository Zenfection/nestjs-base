import { Module } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { COFFEE_DATA_SOURCE, CoffeesController } from './coffees.controller';

// export const COFFEE_DATA_SOURCE = Symbol('COFFEE_DATA_SOURCE'); // Symbol is a unique value that can be used as a key for object properties.

@Module({
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    {
      provide: COFFEE_DATA_SOURCE,
      useValue: [],
    },
  ],
})
export class CoffeesModule {}
