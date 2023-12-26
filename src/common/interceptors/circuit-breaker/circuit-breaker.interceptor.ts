import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly circuitBreakerbyHandler = new WeakMap<
    // eslint-disable-next-line @typescript-eslint/ban-types
    Function,
    CircuitBreaker
  >();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodRef = context.getHandler();
    let circuitBreaker: CircuitBreaker;

    if (this.circuitBreakerbyHandler.has(methodRef)) {
      circuitBreaker = this.circuitBreakerbyHandler.get(methodRef);
    } else {
      circuitBreaker = new CircuitBreaker();
      this.circuitBreakerbyHandler.set(methodRef, circuitBreaker);
    }
    return circuitBreaker.exec(next);
  }
}
