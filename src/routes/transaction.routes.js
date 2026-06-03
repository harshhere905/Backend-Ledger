import express from 'express';
import {createInitialFundsTransaction,createTransaction} from '../controllers/transaction.controller.js'
import {authSystemUserMiddleware,authMiddleware} from '../middlewares/auth.middleware.js';
const router=express.Router();

router.post('/transfer',authMiddleware,createTransaction);
router.post('/initial-funds',authSystemUserMiddleware,createInitialFundsTransaction);
export default router;