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
