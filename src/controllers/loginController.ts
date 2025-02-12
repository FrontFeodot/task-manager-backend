import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/user";
import jwt from "jsonwebtoken";
import CustomError from "../common/utils/error";
import { generateToken } from "../common/utils/authHelper";

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "";

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
  const token = req.body.token;
  if (!token) {
    const { message, payload } = new CustomError(
      "No token, authorization denied",
    );

    res.status(401).send({ message, payload });
  }

  try {
    const authToken = jwt.verify(token, JWT_SECRET);
    if (authToken) {
      res.status(200).send({ success: 1 });
    }
  } catch (err) {
    console.error(err);
    const { message } = new CustomError("Invalid token");

    res.status(401).send({ message });
  }
};
