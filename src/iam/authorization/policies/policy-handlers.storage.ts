import { Injectable, Type } from '@nestjs/common';
import { Policy } from './interface/policy.interface';
import { PolicyHandler } from './interface/policy-handler.interface';

@Injectable()
export class PolicyHandlersStorage {
  private readonly collection = new Map<Type<Policy>, PolicyHandler<any>>();

  add<T extends Policy>(policyCls: Type<T>, handler: PolicyHandler<T>) {
    this.collection.set(policyCls, handler);
  }

  get<T extends Policy>(policyCls: Type<T>): PolicyHandler<T> | undefined {
    const handler = this.collection.get(policyCls);
    if (!handler) {
      throw new Error(`Policy handler not found for ${policyCls.name}`);
    }
    return handler;
  }
}
