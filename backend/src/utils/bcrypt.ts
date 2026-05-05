import bcrypt from 'bcrypt';

const ROUNDS = 12;

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, ROUNDS);
};

export const comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
