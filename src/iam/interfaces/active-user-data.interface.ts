// import { Role } from 'src/users/enums/role.enum';
import { Role } from '@prisma/client';
import { PermissionType } from '../permission.type';

export interface ActiveUserData {
  sub: number;
  email: string;
  role: Role;
  permissions: PermissionType[];
}
