import jwt from 'jsonwebtoken';

import CustomResponse from './error';

interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new CustomResponse({isError: 1, message: 'JWT_SECRET is not defined'});

  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const verifyJwt = (token: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    if (!payload.userId) {
      throw new CustomResponse({isError: 1, message: 'Invalid token payload: userId is missing'});
    }

    return payload.userId;
  } catch (error) {
    if (error instanceof CustomResponse) {
      throw error
    }
    let errMessage
    if (error instanceof jwt.TokenExpiredError) {
      errMessage = 'Token expired';
    }

    if (error instanceof jwt.JsonWebTokenError) {
      errMessage = 'Invalid token';
    }
      errMessage = 'Token expired';

    throw new CustomResponse({ isError: 1, message: errMessage || 'Token verification failed'});
  }
};
