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
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
  ) {}

  async register({ email, password }: RegisterDto) {
    email = email.trim().toLowerCase();

    if (
      await this.identityRepository.existsBy({
        provider: "password",
        providerSubject: email,
      })
    ) {
      throw new HttpException("该邮箱已注册", HttpStatus.CONFLICT);
    }

    await this.dataSource.transaction(async (manager) => {
      const user = await manager.save(manager.create(User));
      await manager.save(
        manager.create(Profile, {
          nickname: email.split("@")[0],
          user,
        }),
      );
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
