export function getAuthHeader() {
  const encoded_credentials = Buffer.from("test_user_1:test_pass_1").toString("base64");
  return { Authorization: `Basic ${encoded_credentials}` };
}

export function dateTimeToDate(datetime: Date): Date {
  const year = datetime.getUTCFullYear();
  const month = datetime.getUTCMonth();
  const day = datetime.getUTCDate();

  return new Date(year, month, day);
}

export function getRandomEnumValue<T>(enumObject: { [key: string]: T }): T {
  const values = Object.values(enumObject);
  return values[Math.floor(Math.random() * values.length)];
}
