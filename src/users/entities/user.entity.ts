import { PermissionType } from 'src/iam/permission.type';
import { Role } from './../enums/role.enum';
export class User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: Role;
  permissions: PermissionType[];
  isTfaEnabled: boolean;
  tfaSecret?: string;
}
