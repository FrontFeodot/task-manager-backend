import express from 'express';

import { authenticate } from '@middlewares/authenticate';

import {
  createBoard,
  deleteBoard,
  getBoardList,
  getSingleBoard,
} from '@controllers/board/boardController';

const router = express.Router();

router.get('/all', authenticate, getBoardList);
router.get('/single', authenticate, getSingleBoard);
router.post('/create', authenticate, createBoard);
router.delete('/delete', authenticate, deleteBoard);

export default router;
