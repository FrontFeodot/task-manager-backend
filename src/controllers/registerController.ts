import { Request, Response } from "express";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

import User from "../models/user";
import CustomResponse from "../common/utils/error";
import { generateToken } from "../common/utils/authHelper";
import { initDefaultBoard } from "./boardController";

export const postRegister = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.send(
      new CustomResponse({
        isError: 1,
        message: "Password and confirm password are not matched",
      }),
    );
  }

  try {
    const userData = await User.findOne({ email });
    if (userData) {
      res
        .status(400)
        .send(
          new CustomResponse({
            isError: 1,
            message: "User with this email already exist",
          }),
        );
      return;
    }

    return bcrypt.hash(password, 12).then(async (hashedPassword: string) => {
      const userId = nanoid();
      const user = new User({
        userId,
        email,
        password: hashedPassword,
      });
      try {
        await user.save();
        await initDefaultBoard(userId);
        res.send(
          new CustomResponse({
            isSuccess: 1,
            message: "success",
            payload: { token: generateToken(user.userId) },
          }),
        );
      } catch (err) {
        res
          .status(500)
          .send(
            new CustomResponse({ isError: 1, message: "Something went wrong" }),
          );
        return console.log("saving error", err);
      }
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: "Something went wrong" }),
      );
  }
};
