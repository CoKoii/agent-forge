import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: "昵称必须是字符串" })
  @MaxLength(50, { message: "昵称长度不能超过50个字符" })
  nickname?: string;

  @IsOptional()
  @IsString({ message: "头像地址必须是字符串" })
  @MaxLength(500, { message: "头像地址长度不能超过500个字符" })
  avatarUrl?: string;
}
