import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        // 数据库类型
        type: "postgres",
        // 主机
        host: cs.getOrThrow("DB_HOST"),
        // 端口
        port: cs.getOrThrow<number>("DB_PORT"),
        // 用户名
        username: cs.getOrThrow("DB_USERNAME"),
        // 密码
        password: cs.getOrThrow("DB_PASSWORD"),
        // 数据库名
        database: cs.getOrThrow("DB_DATABASE"),
        // 自动加载实体
        autoLoadEntities: true,
        // 迁移文件路径
        migrations: [__dirname + "/migrations/*{.js,.ts}"],
        // 生产环境自动执行迁移
        migrationsRun: cs.get("NODE_ENV") === "production",
        // 开发环境同步表结构
        synchronize: cs.get("NODE_ENV") === "development",
        // 开发环境输出 SQL 日志
        logging: cs.get("NODE_ENV") === "development",
        // 连接池最大连接数
        extra: { max: cs.getOrThrow<number>("DB_POOL_MAX") },
      }),
    }),
  ],
})
export class DatabaseModule {}
