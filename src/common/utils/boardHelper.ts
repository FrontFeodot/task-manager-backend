import { Document, Types } from "mongoose";
import { Board } from "../../models/board/board";
import { IBoard } from "../interfaces/models/IBoardSchema";
import CustomResponse from "./error";

export const getBoardHelper = async (userId: string, boardId: string): Promise<Document & IBoard | CustomResponse> => {
    try {
        const response = await Board.findOne({boardId, userId}).exec();
        if (!response) {
            throw response
        }
        return response
    } catch (err) {
        return new CustomResponse({isError: 1, message: 'Get board error', payload: err}) as CustomResponse
    }
}