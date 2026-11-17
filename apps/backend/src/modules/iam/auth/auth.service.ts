import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { RegisterDto } from "./dto/register.dto";
import { User } from "../user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Identity } from "../identity/entities/identity.entity";
import { Profile } from "../profile/entities/profile.entity";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  // =========================依赖注入=========================
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
  ) {}

  // =========================用户注册=========================
  async register({ email, password }: RegisterDto) {
    // 统一邮箱格式，避免大小写和首尾空格造成重复账号
    email = email.trim().toLowerCase();

    // 注册前检查已有的密码身份
    if (
      await this.identityRepository.existsBy({
        provider: "password",
        providerSubject: email,
      })
    ) {
      throw new HttpException("该邮箱已注册", HttpStatus.CONFLICT);
    }

    // 在同一事务中创建账号、资料和登录身份
    await this.dataSource.transaction(async (manager) => {
      // 创建用户账号
      const user = await manager.save(manager.create(User));
      // 创建用户资料，并用邮箱前缀初始化昵称
      await manager.save(
        manager.create(Profile, {
          nickname: email.split("@")[0],
          user,
        }),
      );
      // 创建密码登录身份并保存密码哈希
      await manager.save(
        manager.create(Identity, {
          provider: "password",
          providerSubject: email,
          passwordHash: await argon2.hash(password),
          user,
        }),
      );
    });

    return "注册成功";
  }

  create(createAuthDto: CreateAuthDto) {
    return "This action adds a new auth";
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
