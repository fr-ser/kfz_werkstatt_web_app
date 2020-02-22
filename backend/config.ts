export const basicAuthCredentials = setCredentials();

function setCredentials(): { [user: string]: string } {
  const BASIC_AUTH_CREDENTIALS = process.env.BASIC_AUTH_CREDENTIALS;

  if (!BASIC_AUTH_CREDENTIALS) {
    throw Error(`Invalid BASIC_AUTH_CREDENTIALS: ${BASIC_AUTH_CREDENTIALS}`);
  }

  let credentials: { [user: string]: string } = {};

  // Credentials are expected in this format: user1:pass1,user2:pass2,...
  for (const user_password of (process.env.BASIC_AUTH_CREDENTIALS as string).split(",")) {
    const [user, password] = user_password.split(":");
    credentials[user] = password;
  }

  if (Object.keys(credentials).length == 0) {
    throw Error(`Invalid BASIC_AUTH_CREDENTIALS: ${process.env.basicAuthCredentials}`);
  }

  return credentials;
}
