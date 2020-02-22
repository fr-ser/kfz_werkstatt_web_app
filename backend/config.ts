export const BASIC_AUTH_CREDENTIALS = getCredentials();
export const DB_URI = process.env.DB_URI;

const requiredEnvVars = ["BASIC_AUTH_CREDENTIALS", "DB_URI"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw Error(`Invalid ${envVar}: ${process.env[envVar]}`);
  }
}

function getCredentials(): { [user: string]: string } {
  const basicAuthCredentials = process.env.BASIC_AUTH_CREDENTIALS as string;

  let credentials: { [user: string]: string } = {};

  // Credentials are expected in this format: user1:pass1,user2:pass2,...
  for (const user_password of basicAuthCredentials.split(",")) {
    const [user, password] = user_password.split(":");
    credentials[user] = password;
  }

  return credentials;
}
