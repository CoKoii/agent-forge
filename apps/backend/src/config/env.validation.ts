import joi from "joi";

export const envValidationSchema = joi.object({
  // 应用
  OBSERVE_APP_KEY: joi.string().allow("").default(""),
  OBSERVE_APP_SECRET: joi.string().allow("").default(""),
});
