import { OtpAuthenticationService } from './otp-authentication.service';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { PrismaService } from 'nestjs-prisma';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from 'src/users/entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  RefreshTokenIdsStorage,
  RefreshTokenIdsStorageError,
} from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly hashService: HashingService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly otpAuthenticationService: OtpAuthenticationService,
  ) {}

  async checkExist(email: string): Promise<User | null> {
    return (await this.prisma.user.findUnique({
      where: {
        email,
      },
    })) as User;
  }

  async signUp(signUp: SignUpDto) {
    const user = new User();
    user.email = signUp.email;
    user.password = await this.hashService.hash(signUp.password);

    if ((await this.checkExist(user.email)) !== null)
      throw new ConflictException('Email already exists');

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

  async signIn(signInDto: SignInDto) {
    console.log(signInDto);
    const user = await this.checkExist(signInDto.email);
    if (!user) throw new ConflictException('Email not exists');

    const isMatch = await this.hashService.compare(
      signInDto.password,
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException('User or password not match');

    if (user.isTfaEnabled) {
      const isValid = this.otpAuthenticationService.verifyCode(
        signInDto.tfaCode,
        user.tfaSecret,
      );
      if (!isValid) throw new UnauthorizedException('Invalid TFA code');
    }

    return await this.generateToken(user);
  }

  async generateToken(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
      await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshToken.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: sub,
        },
      });

      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );
      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Refresh Token is invalid');
      }

      return await this.generateToken(user as User);
    } catch (error) {
      if (error instanceof RefreshTokenIdsStorageError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException(error.message);
    }
  }

  private async signToken<T>(userID: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userID,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
