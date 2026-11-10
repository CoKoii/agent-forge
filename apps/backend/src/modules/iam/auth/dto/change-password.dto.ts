import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
  @IsString({ message: "旧密码必须是字符串" })
  @IsNotEmpty({ message: "旧密码不能为空" })
  oldPassword: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: "新密码强度不足，需包含大小写字母、数字和特殊字符，且不少于8位" },
  )
  newPassword: string;

  @IsString({ message: "确认密码必须是字符串" })
  @IsNotEmpty({ message: "确认密码不能为空" })
  confirmPassword: string;
}
