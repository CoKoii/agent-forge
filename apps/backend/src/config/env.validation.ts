import joi from "joi";

export const envValidationSchema = joi.object({
  // =========================基础服务配置=========================
  // 生产环境/开发环境
  NODE_ENV: joi.string().default("development"),

  // 端口
  PORT: joi.number().port().default(3000),

  // 日志等级
  LOG_LEVEL: joi.string().default("info"),

  // CORS 跨域
  CORS_ORIGIN: joi
    .string()
    .min(1)
    .required()
    .custom((value: string, helpers) =>
      value.split(",").some((origin) => origin.trim() === "*")
        ? helpers.error("any.invalid")
        : value,
    ),

  // Observe
  OBSERVE_APP_KEY: joi.string().allow("").default(""),
  OBSERVE_APP_SECRET: joi.string().allow("").default(""),

  // JWT
  JWT_SECRET: joi.string().min(32).required(),
  ACCESS_TOKEN_TTL_SECONDS: joi.number().integer().min(60).default(900),
  REFRESH_TOKEN_TTL_SECONDS: joi.number().integer().min(60).default(604800),

  // =========================数据库配置=========================
  DB_HOST: joi.string().min(1).required(),
  DB_PORT: joi.number().port().required(),
  DB_USERNAME: joi.string().min(1).required(),
  DB_PASSWORD: joi.string().min(1).required(),
  DB_DATABASE: joi.string().min(1).required(),

  // 数据库连接池
  DB_POOL_MAX: joi.number().integer().min(1).max(100).required(),
});
