import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";

dotenv.config({ path: envFile });

export const commonConfigs = {
  NODE_ENV: process.env.NODE_ENV,
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHATGPT_BOT_URL: process.env.CHATGPT_BOT_URL,
};
