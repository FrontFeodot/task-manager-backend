import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { nanoid } from 'nanoid';

import { User } from '@models/user';

import { initDefaultBoard } from '@controllers/board/boardController';

import { generateToken } from '@common/utils/authHelper';
import CustomResponse from '@common/utils/error';

export const postRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.send(
      new CustomResponse({
        isError: 1,
        message: 'Password and confirm password are not matched',
      })
    );
  }

  try {
    const userData = await User.findOne({ email });
    if (userData) {
      res.status(400).send(
        new CustomResponse({
          isError: 1,
          message: 'User with this email already exist',
        })
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
        await initDefaultBoard(userId, email);
        res.send(
          new CustomResponse({
            isSuccess: 1,
            message: 'success',
            payload: { token: generateToken(user.userId), email },
          })
        );
      } catch (err) {
        res
          .status(500)
          .send(
            new CustomResponse({ isError: 1, message: 'Something went wrong' })
          );
        return console.error('saving error', err);
      }
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: 'Something went wrong' })
      );
  }
};
