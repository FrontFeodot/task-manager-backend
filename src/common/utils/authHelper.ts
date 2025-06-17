import jwt from 'jsonwebtoken';
import CustomResponse from './error';
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || '';

export const generateToken = (userId: string) =>
  jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '7d' });


export const verifyJwt = (token: string): string | CustomResponse => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    if (!userId) {
      throw new CustomResponse({ isError: 1, message: 'Invalid token' });
    }
    return userId
  } catch (error) {
    if (error instanceof CustomResponse) {
      return error
    }
    return new CustomResponse({isError: 1, message: 'Invalid token', payload: error})
  }
}