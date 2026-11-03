import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateUserDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: "用户名必须是字符串" })
  @MaxLength(50, { message: "用户名长度不能超过50个字符" })
  @MinLength(6, { message: "用户名长度不能少于6个字符" })
  username?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ArrayUnique()
  roleIds?: number[];
}
