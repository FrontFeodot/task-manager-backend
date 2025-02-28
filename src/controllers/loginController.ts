import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/user";
import jwt from "jsonwebtoken";
import CustomResponse from "../common/utils/error";
import { generateToken } from "../common/utils/authHelper";

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export const postLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(400)
        .send(new CustomResponse({ isError: 1, message: "User not found" }));
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).send(
        new CustomResponse({
          isError: 1,
          message: "Invalid password",
          payload: {
            field: "password",
          },
        }),
      );
      return;
    }

    res
      .status(200)
      .send(
        new CustomResponse({
          isSuccess: 1,
          message: "Login successful",
          payload: { token: generateToken(user.userId) },
        }),
      );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        new CustomResponse({
          isError: 1,
          message: "Error during login",
          payload: err,
        }),
      );
  }
};

export const getProtected = (req: Request, res: Response): void => {
  const token = req.body.token;
  if (!token) {
    res.status(401).send(
      new CustomResponse({
        isError: 1,
        message: "No token, authorization denied",
      }),
    );
  }

  try {
    const authToken = jwt.verify(token, JWT_SECRET);
    if (authToken) {
      res
        .status(200)
        .send(new CustomResponse({ isSuccess: 1, message: "Success" }));
    }
  } catch (err) {
    console.error(err);
    res
      .status(401)
      .send(new CustomResponse({ isError: 1, message: "Invalid token" }));
  }
};
