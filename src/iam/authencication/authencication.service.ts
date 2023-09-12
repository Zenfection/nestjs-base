import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { PrismaService } from 'nestjs-prisma';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from 'src/users/entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthencicationService {
  constructor(
    private hashService: HashingService,
    private prisma: PrismaService,
  ) {}

  async checkExist(email: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async signUp(signUp: SignUpDto) {
    const user = new User();
    user.email = signUp.email;
    user.password = await this.hashService.hash(signUp.password);

    if (await this.checkExist(signUp.email)) return null;

    try {
      await this.prisma.user.create({
        data: {
          ...user,
          name: 'Anonymous',
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async signIn(signInDto: SignInDto): Promise<boolean> {
    const user = await this.checkExist(signInDto.email);
    if (!user) throw new ConflictException('Email not exists');

    const isMatch = await this.hashService.compare(
      signInDto.password,
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException('User or password not match');

    return true;
  }
}
