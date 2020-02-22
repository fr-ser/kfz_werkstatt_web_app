export function getAuthHeader() {
  const encoded_credentials = Buffer.from("test_user_1:test_pass_1").toString("base64");
  return { Authorization: `Basic ${encoded_credentials}` };
}
