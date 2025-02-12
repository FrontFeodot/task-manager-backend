import { Request, Response } from "express";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

import User from "../models/user";
import CustomError from "../common/utils/error";
import { generateToken } from "../common/utils/authHelper";
import { initDefaultBoard } from "./boardController";

export const postRegister = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.send("Password and confirm password are not matched");
  }

  try {
    const userData = await User.findOne({ email });
    if (userData) {
      const { message } = new CustomError("User with this email already exist");
      res.status(400).send({ message });
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
        res.send({ message: "success", token: generateToken(user.userId) });
      } catch (err) {
        const { message } = new CustomError("Something went wrong");
        res.status(500).send({ message });
        return console.log("saving error", err);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(new CustomError("Something went wrong"));
  }
};
