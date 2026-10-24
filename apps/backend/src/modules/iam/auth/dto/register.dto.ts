import { IsString, IsStrongPassword } from "class-validator";

export class RegisterDto {
  @IsString()
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

  @IsString()
  confirmPassword: string;
}
