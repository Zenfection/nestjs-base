import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { PrismaService } from 'nestjs-prisma';
import { SignInDto } from './dto/sign-in.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SessionAuthenticationService {
  constructor(
    private readonly hashService: HashingService,
    private readonly prisma: PrismaService,
  ) {}

  private async checkExist(email: string): Promise<User | null> {
    return (await this.prisma.user.findUnique({
      where: {
        email,
      },
    })) as User;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.checkExist(signInDto.email);
    if (!user) throw new ConflictException('Email not exists');

    const isMatch = await this.hashService.compare(
      signInDto.password,
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException('User or password not match');

    return user;
  }
}
