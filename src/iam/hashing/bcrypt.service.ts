import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import { hash, genSalt, compare } from 'bcrypt';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string | Buffer): Promise<string> {
    const salt = await genSalt(10);
    return hash(data, salt);
  }
  async compare(data: string | Buffer, encrypt: string): Promise<boolean> {
    return compare(data, encrypt);
  }
}
