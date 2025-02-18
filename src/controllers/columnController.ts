import { Request, Response } from "express";
import { Column } from "../models/board/column";
import CustomError from "../common/utils/error";

export const createColumn = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const column = new Column(data);
    await column.save();
    res.status(200).json({ message: "success" });
  } catch (err) {
    res
      .status(500)
      .json(new CustomError("An error occurred while creating a column"));
  }
};
