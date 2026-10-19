import joi from "joi";

export const envValidationSchema = joi.object({
  // 应用
  NODE_ENV: joi.string().valid("development", "production", "test").default("development"),
  PROJECT_NAME: joi.string().trim().min(1).required(),
  PORT: joi.number().port().default(3000),
  LOG_LEVEL: joi.string().valid("debug", "info", "warn", "error").default("info"),
  OBSERVE_APP_KEY: joi.string().allow("").default(""),
  OBSERVE_APP_SECRET: joi.string().allow("").default(""),
  CORS_ORIGIN: joi.when("NODE_ENV", {
    is: "production",
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().trim().min(1).required(),
    otherwise: joi.string().trim().default("*"),
  }),

  // 数据库
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().port().required(),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_DATABASE: joi.string().required(),
  DB_POOL_MAX: joi.number().integer().min(1).required(),

  // Redis
  REDIS_HOST: joi.string().default("localhost"),
  REDIS_PORT: joi.number().port().default(6379),
  REDIS_PASSWORD: joi.string().required(),
  REDIS_DB: joi.number().integer().min(0).default(0),

  // 邮件 SMTP
  MAIL_ENABLED: joi.boolean().default(false),
  SMTP_HOST: joi.when("MAIL_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().required(),
    otherwise: joi.string().optional(),
  }),
  SMTP_PORT: joi.when("MAIL_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.number().port().required(),
    otherwise: joi.number().port().optional(),
  }),
  SMTP_SECURE: joi.boolean().default(true),
  SMTP_USER: joi.when("MAIL_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().required(),
    otherwise: joi.string().optional(),
  }),
  SMTP_PASSWORD: joi.when("MAIL_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().required(),
    otherwise: joi.string().optional(),
  }),
  SMTP_FROM: joi.when("MAIL_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().required(),
    otherwise: joi.string().optional(),
  }),

  // 前端地址
  LOGIN_URL: joi.string().uri().required(),

  // 注册验证码：关闭时可直接使用 email + password 注册
  CAPTCHA_ENABLED: joi
    .boolean()
    .default(false)
    .when("MAIL_ENABLED", {
      is: false,
      // oxlint-disable-next-line unicorn/no-thenable
      then: joi.valid(false),
    }),

  // IAM 默认数据初始化
  BOOTSTRAP_ENABLED: joi.boolean().default(false),
  BOOTSTRAP_SUPER_ADMIN_EMAIL: joi.when("BOOTSTRAP_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().email().required(),
    otherwise: joi.string().email().optional(),
  }),
  BOOTSTRAP_SUPER_ADMIN_PASSWORD: joi.when("BOOTSTRAP_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().min(8).required(),
    otherwise: joi.string().min(8).optional(),
  }),
  BOOTSTRAP_ADMIN_EMAIL: joi.when("BOOTSTRAP_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().email().required(),
    otherwise: joi.string().email().optional(),
  }),
  BOOTSTRAP_ADMIN_PASSWORD: joi.when("BOOTSTRAP_ENABLED", {
    is: true,
    // oxlint-disable-next-line unicorn/no-thenable
    then: joi.string().min(8).required(),
    otherwise: joi.string().min(8).optional(),
  }),

  // JWT
  JWT_SECRET: joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES: joi
    .string()
    .pattern(/^[1-9]\d*[smhd]$/)
    .default("15m"),
  JWT_REFRESH_EXPIRES: joi
    .string()
    .pattern(/^[1-9]\d*[smhd]$/)
    .default("7d"),
});
