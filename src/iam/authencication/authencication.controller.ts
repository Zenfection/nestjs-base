import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthencicationService } from './authencication.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('authencication')
export class AuthencicationController {
  constructor(private readonly authService: AuthencicationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignUpDto) {
    return this.authService.signIn(signInDto);
  }
}
