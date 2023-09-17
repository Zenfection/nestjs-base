import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ActiveUserData | undefined = request[REQUEST_USER_KEY];
    return field ? user && user?.[field] : user;
  },
);
