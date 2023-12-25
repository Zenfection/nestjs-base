import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { LazyModuleLoader } from '@nestjs/core';
import { RewardsService } from 'src/rewards/rewards.service';

export const COFFEE_DATA_SOURCE = Symbol('COFFEE_DATA_SOURCE'); // Symbol is a unique value that can be used as a key for object properties.

export interface CoffeeDataSource {
  [index: number]: Coffee;
}

@Controller('coffees')
export class CoffeesController {
  constructor(
    private readonly coffeesService: CoffeesService,
    @Inject(COFFEE_DATA_SOURCE)
    private dataSoruce: CoffeeDataSource,
    private readonly lazyModuleLoader: LazyModuleLoader,
  ) {}

  @Post()
  async create(@Body() createCoffeeDto: CreateCoffeeDto) {
    console.time();
    const rewardsModuleRef = await this.lazyModuleLoader.load(() =>
      import('../rewards/rewards.module').then((m) => m.RewardsModule),
    );
    const rewardsService =
      await rewardsModuleRef.resolve<RewardsService>(RewardsService);

    rewardsService.grantReward();
    console.timeEnd();
    return this.coffeesService.create(createCoffeeDto);
  }

  @Get()
  findAll() {
    return this.coffeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(+id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(+id);
  }
}
