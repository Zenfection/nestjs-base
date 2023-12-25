import { IntervalHost } from 'src/scheduler/decorators/interval.host/interval.host.decorator';
import { Interval } from 'src/scheduler/decorators/interval/interval.decorator';

@IntervalHost
export class CronService {
  @Interval(1000)
  everySecond() {
    console.log('Log: Every second');
  }
}
