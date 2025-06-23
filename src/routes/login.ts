import express from 'express';

import { getProtected, postLogin } from '@controllers/auth/loginController';
import { postRegister } from '@controllers/auth/registerController';

const router = express.Router();

router.post('/login', postLogin);
router.post('/signup', postRegister);
router.post('/protected', getProtected);

export default router;
