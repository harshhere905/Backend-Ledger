import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createAccount, getAccounts, getBalance} from '../controllers/account.controller.js';
const router=express.Router();

router.post('/',authMiddleware,createAccount)
router.get('/',authMiddleware,getAccounts);
router.get('/balance/:accountId',authMiddleware,getBalance);
export default router;