import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CustomResponse from '../common/utils/error';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization;
  if (!token) {
    res
      .status(401)
      .send(new CustomResponse({ isError: 1, message: 'Unauthorized' }));
    return;
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    if (!userId) {
      throw new CustomResponse({ isError: 1, message: 'Invalid token' });
    }
    req.body.userId = userId;
    next();
  } catch (error) {
    res.status(401).send({ error });
  }
};
