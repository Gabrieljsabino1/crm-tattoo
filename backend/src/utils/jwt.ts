import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'crm_tattoo_jwt_secret_dev_2026';

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
