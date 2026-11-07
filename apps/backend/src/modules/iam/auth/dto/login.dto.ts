import { IsNotEmpty, IsString, IsBoolean } from "class-validator";

export class LoginDto {
  @IsString({ message: "用户名必须是字符串" })
  @IsNotEmpty({ message: "用户名不能为空" })
  username: string;

  @IsString({ message: "密码必须是字符串" })
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;

  @IsBoolean({ message: "验证码必须是布尔值" })
  @IsNotEmpty({ message: "验证码不能为空" })
  captcha: boolean;
}
