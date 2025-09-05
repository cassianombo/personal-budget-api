import { IsEnum } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}
