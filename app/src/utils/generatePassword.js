// Returning a very strong, ≥ 128 bits password,
// based on 25 characters generated from A-Z, a-z, 0-9.
export const generatePassword = () => {
  const length = 25;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};
