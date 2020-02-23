import { BASIC_AUTH_CREDENTIALS } from "@backend/config";

export async function validate(username: string, password: string) {
  if (!BASIC_AUTH_CREDENTIALS[username] || BASIC_AUTH_CREDENTIALS[username] !== password) {
    return new Error("Invalid credentials");
  }
}
