import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../common/utils/error";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    if (!userId) {
      throw new CustomError("Invalid token");
    }
    req.body.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
