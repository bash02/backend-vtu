// Generate a random 6-digit code
const generateVerificationCode = (): number =>
  Math.floor(100000 + Math.random() * 900000);

const verificationCodes: Map<string, { code: number; expiresAt: number }> =
  new Map();

const setVerificationCode = (email: string, code: number): boolean => {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  return verificationCodes.set(email, { code, expiresAt }), true;
};

const getVerificationCode = (
  email: string
): { code: number; expiresAt: number } | undefined => {
  return verificationCodes.get(email);
};

const deleteVerificationCode = (email: string): boolean => {
  return verificationCodes.delete(email);
};

export {
  generateVerificationCode,
  setVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
};
