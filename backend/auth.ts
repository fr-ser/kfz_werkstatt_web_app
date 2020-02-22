import { basicAuthCredentials } from "./config";

export async function validate(username: string, password: string) {
  if (!basicAuthCredentials[username] || basicAuthCredentials[username] !== password) {
    return new Error("Invalid credentials");
  }
}
