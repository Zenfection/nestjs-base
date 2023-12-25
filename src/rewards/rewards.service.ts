import { Injectable } from '@nestjs/common';

@Injectable()
export class RewardsService {
  grantReward() {
    console.log('Hello from RewardsService!');
  }
}
