import jwt from 'jsonwebtoken';
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || '';

export const generateToken = (userId: string) =>
  jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '7d' });
