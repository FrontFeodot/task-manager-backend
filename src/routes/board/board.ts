import express from 'express';
import {
  deleteBoard,
  getBoardList,
  updateDoneColumn,
  updateBoardTitle,
  updateColumnOrder,
  updateTaskOrder,
  shareBoard,
} from '../../controllers/board/boardController';
import { authenticate } from '../../middlewares/authenticate';
import { createBoard } from '../../controllers/board/boardController';

const router = express.Router();

router.get('/all', authenticate, getBoardList);
router.post('/create', authenticate, createBoard);
router.delete('/delete', authenticate, deleteBoard);
router.put('/update/title', authenticate, updateBoardTitle);
router.put('/update/tasks', authenticate, updateTaskOrder);
router.put('/update/columns', authenticate, updateColumnOrder);
router.put('/update/done-column', authenticate, updateDoneColumn);
router.post('/share', authenticate, shareBoard);

export default router;
