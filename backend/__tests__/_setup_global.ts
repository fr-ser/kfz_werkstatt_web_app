import { promisify } from "util";
import { exec } from "child_process";

import * as faker from "faker";

const async_exec = promisify(exec);

export default async function() {
  process.env.BASIC_AUTH_CREDENTIALS = "test_user_1:test_pass_1,test_user_2:test_pass_2";
  process.env.DB_URI = "postgres://kfz:password@localhost:8432/kfz";

  await async_exec("docker-compose up -d db");
  faker.setLocale("de");
}
