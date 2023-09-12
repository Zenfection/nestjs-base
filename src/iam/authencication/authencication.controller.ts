import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  // Res,
} from '@nestjs/common';
import { AuthencicationService } from './authencication.service';
import { SignUpDto } from './dto/sign-up.dto';
// import { Response } from 'express';

@Controller('authencication')
export class AuthencicationController {
  constructor(private readonly authService: AuthencicationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignUpDto) {
    return await this.authService.signIn(signInDto);
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
