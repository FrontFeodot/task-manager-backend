import express from 'express';
import { authenticate } from '../../middlewares/authenticate';
import {
  deleteColumn,
  updateColumn,
} from '../../controllers/board/columnController';

const router = express.Router();

router.put('/update', authenticate, updateColumn);
router.delete('/delete', authenticate, deleteColumn);

export default router;
