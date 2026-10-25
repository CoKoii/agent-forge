import { IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsString({ message: "用户名必须是字符串" })
  @IsNotEmpty({ message: "用户名不能为空" })
  @MaxLength(50, { message: "用户名长度不能超过50个字符" })
  @MinLength(6, { message: "用户名长度不能少于6个字符" })
  username: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: "密码强度不足，需包含大小写字母、数字和特殊字符，且不少于8位" },
  )
  password: string;

  @IsString({ message: "确认密码必须是字符串" })
  @IsNotEmpty({ message: "确认密码不能为空" })
  confirmPassword: string;
}
