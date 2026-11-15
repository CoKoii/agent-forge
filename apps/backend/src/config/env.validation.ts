import joi from "joi";

export const envValidationSchema = joi.object({
  // =========================基础服务配置=========================
  // 端口
  PORT: joi.number().port().required(),

  // 日志等级
  LOG_LEVEL: joi.string().required(),

  // CORS 跨域
  CORS_ORIGIN: joi.string().min(1).required(),

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
});
