import express from 'express';
import {
  deleteBoard,
  getBoardList,
} from '../../controllers/board/boardController';
import { authenticate } from '../../middlewares/authenticate';
import { createBoard } from '../../controllers/board/boardController';

const router = express.Router();

router.get('/all', authenticate, getBoardList);
router.post('/create', authenticate, createBoard);
router.delete('/delete', authenticate, deleteBoard);

export default router;
