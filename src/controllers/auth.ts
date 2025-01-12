import { Request, Response } from "express";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

import User from "../models/user";
import jwt from "jsonwebtoken";
import CustomError from "../utils/error";
import { generateToken } from "../utils/authHelper";

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export const postSignup = async (
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

export const postLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const { message } = new CustomError("User not found");

      res.status(400).send({ message });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const { message, payload } = new CustomError("Invalid password", {
        field: "password",
      });
      res.status(400).send({
        message,
        payload,
      });
      return;
    }

    res
      .status(200)
      .send({ message: "Login successful", token: generateToken(user.userId) });
  } catch (err) {
    console.error(err);
    const { message, payload } = new CustomError("Error during login", err);

    res.status(500).send({ message, payload });
  }
};

export const getProtected = (req: Request, res: Response): void => {
  const token = req.cookies.authToken; // get token from cookie

  if (!token) {
    const { message, payload } = new CustomError(
      "No token, authorization denied",
    );

    res.status(401).send({ message, payload });
  }

  try {
    const authToken = jwt.verify(token, JWT_SECRET);

    res.status(200).send({ message: "Access granted", authToken });
  } catch (err) {
    console.error(err);
    const { message } = new CustomError("Invalid token");

    res.status(401).send({ message });
  }
};
