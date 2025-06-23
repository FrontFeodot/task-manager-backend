import { NextFunction, Request, Response } from 'express';

import { verifyJwt } from '@common/utils/authHelper';
import CustomResponse from '@common/utils/error';

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
    const userId = verifyJwt(token);
    req.body.userId = userId;
    next();
  } catch (error) {
    res.status(401).send({ error });
  }
};
