import * as faker from "faker";

export function getAuthHeader() {
  const encoded_credentials = Buffer.from("test_user_1:test_pass_1").toString("base64");
  return { Authorization: `Basic ${encoded_credentials}` };
}

export function getRandomDate(): string {
  return faker.date
    .past()
    .toISOString()
    .substr(0, 10);
}

export function getRandomArticleId(length = 15): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ" +
    "abcdefghijklmnopqrstuvwxyzäöüß" +
    "0123456789" +
    ".:,;-_/\\|";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getRandomEnumValue<T>(enumObject: { [key: string]: T }): T {
  const values = Object.values(enumObject);
  return values[Math.floor(Math.random() * values.length)];
}
