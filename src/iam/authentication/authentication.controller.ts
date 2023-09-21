import { OtpAuthenticationService } from './otp-authentication.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  // Res,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ActiveUser } from './decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { SignInDto } from './dto/sign-in.dto';

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly otpAuthenticationService: OtpAuthenticationService,
  ) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer)
  @Post('2fa/generate')
  async generateQrCode(
    @Res() response: Response,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const { uri, secret } = await this.otpAuthenticationService.generateSecret(
      activeUser.email,
    );

    await this.otpAuthenticationService.enableTfaSecret(
      activeUser.email,
      secret,
    );

    response.type('png');
    return toFileStream(response, uri);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('sign-in')
  // async signIn(
  //   @Res({ passthrough: true }) response: Response,
  //   @Body() signInDto: SignUpDto,
  // ) {
  //   const accessToken = await this.authService.signIn(signInDto);
  //   response.cookie('access_token', accessToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: true,
  //   });
  // }
}
