import { PolicyHandlersStorage } from './policy-handlers.storage';
import { Injectable } from '@nestjs/common';
import { Policy } from './interface/policy.interface';
import { PolicyHandler } from './interface/policy-handler.interface';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

export class FramworkContributorPolicy implements Policy {
  name = 'FrameworkContributor';
}

@Injectable()
export class FramworkContributorPolicyHandler
  implements PolicyHandler<FramworkContributorPolicy>
{
  constructor(private readonly policyHandlersStorage: PolicyHandlersStorage) {
    this.policyHandlersStorage.add(FramworkContributorPolicy, this);
  }
  async handle(
    policy: FramworkContributorPolicy,
    user: ActiveUserData,
  ): Promise<void> {
    const isContributor = user.email.endsWith('@gmail.com');
    if (!isContributor) {
      throw new Error('You are not a contributor');
    }
  }
}
