
import express from 'express';
import { getProtected, postLogin, postSignup } from '../controllers/auth';

const router = express.Router();

router.post('/login', postLogin);
router.post('/signup', postSignup);
router.post('/protected', getProtected);

export default router;
