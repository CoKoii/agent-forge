import joi from "joi";

export const envValidationSchema = joi.object({
  // =========================基础服务配置=========================
  // 运行环境
  NODE_ENV: joi.string().valid("development", "production").required(),
  // 端口
  PORT: joi.number().port().required(),
  // 日志等级
  LOG_LEVEL: joi.string().required(),
  // CORS 跨域
  CORS_ORIGIN: joi.string().min(1).required(),
  // JWT 密钥
  JWT_ACCESS_SECRET: joi.string().min(32).required(),
  // Access Token 过期时间
  JWT_ACCESS_EXPIRES_IN: joi.number().integer().min(1).required(),
  // Refresh Token 过期时间
  JWT_REFRESH_EXPIRES_IN: joi.number().integer().min(1).required(),

  // =========================数据库配置=========================
  // 主机
  DB_HOST: joi.string().min(1).required(),
  // 端口
  DB_PORT: joi.number().port().required(),
  // 用户名
  DB_USERNAME: joi.string().min(1).required(),
  // 密码
  DB_PASSWORD: joi.string().min(1).required(),
  // 数据库名
  DB_DATABASE: joi.string().min(1).required(),
  // 连接池最大连接数
  DB_POOL_MAX: joi.number().integer().min(1).max(100).required(),

  // =========================Redis 配置=========================
  // 主机
  REDIS_HOST: joi.string().min(1).required(),
  // 端口
  REDIS_PORT: joi.number().port().required(),
  // 密码，允许为空但必须定义
  REDIS_PASSWORD: joi.string().allow("").required(),
  // 数据库编号
  REDIS_DB: joi.number().integer().min(0).required(),

  // =========================GitHub OAuth 配置=========================
  // 客户端 ID
  GITHUB_CLIENT_ID: joi.string().allow("").optional(),
  // 客户端密钥
  GITHUB_CLIENT_SECRET: joi.string().allow("").optional(),
  // 授权回调地址
  GITHUB_CALLBACK_URL: joi.string().uri().allow("").optional(),

  // =========================Google OAuth 配置=========================
  // 客户端 ID
  GOOGLE_CLIENT_ID: joi.string().allow("").optional(),
  // 客户端密钥
  GOOGLE_CLIENT_SECRET: joi.string().allow("").optional(),
  // 授权回调地址
  GOOGLE_CALLBACK_URL: joi.string().uri().allow("").optional(),
});
