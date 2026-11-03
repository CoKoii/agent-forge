import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "用户名必须是字符串" })
  @MaxLength(50, { message: "用户名长度不能超过50个字符" })
  @MinLength(6, { message: "用户名长度不能少于6个字符" })
  username?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ArrayUnique()
  roleIds?: number[];
}
