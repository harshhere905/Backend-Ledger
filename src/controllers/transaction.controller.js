import Transaction from '../models/transaction.models.js';
import Ledger from '../models/ledger.models.js';
import Account from '../models/account.models.js';
import mongoose from 'mongoose';
import User from '../models/user.models.js';
import {sendTransactionEmail} from '../services/email.services.js'

const createInitialFundsTransaction = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { toAccount, amount, idempotencyKey } = req.body;

        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount and idempotencyKey are required fields"
            });
        }

        const toUserAccount = await Account.findById(toAccount);

        if (!toUserAccount) {
            return res.status(404).json({
                message: "Recipient account not found"
            });
        }

        const fromUserAccount = await Account.findOne({
            user: req.user.userId
        });

        if (!fromUserAccount) {
            return res.status(404).json({
                message: "System account not found"
            });
        }

        await session.startTransaction();

        const [transaction] = await Transaction.create(
            [{
                fromAccount: fromUserAccount._id,
                toAccount: toUserAccount._id,
                amount,
                idempotencyKey,
                status: "PENDING"
            }],
            { session }
        );

        await Ledger.create(
            [{
                account: fromUserAccount._id,
                amount,
                transaction: transaction._id,
                type: "DEBIT"
            }],
            { session }
        );

        await Ledger.create(
            [{
                account: toUserAccount._id,
                amount,
                transaction: transaction._id,
                type: "CREDIT"
            }],
            { session }
        );

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            message: "Initial funds transaction created successfully",
            transaction
        });

    } catch (err) {
        await session.abortTransaction();

        return res.status(500).json({
            message: "Transaction failed",
            error: err.message
        });
    } finally {
        session.endSession();
    }
};
const createTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const fromUserAccount = await Account.findById(fromAccount);

        if (!fromUserAccount) {
            return res.status(404).json({
                message: "From account not found"
            });
        }

        const toUserAccount = await Account.findById(toAccount);

        if (!toUserAccount) {
            return res.status(404).json({
                message: "To account not found"
            });
        }

        if (fromUserAccount.user.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only transfer from your account"
            });
        }

        if (fromAccount === toAccount) {
            return res.status(400).json({
                message: "From and To accounts cannot be the same"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be positive"
            });
        }

        const existingTransaction = await Transaction.findOne({
    idempotencyKey
});

    if (existingTransaction) {
      if (existingTransaction.status === "PENDING") {
        return res.status(409).json({
            message: "Please wait. Your previous transaction is still being processed."
        });
      }

      if (existingTransaction.status === "COMPLETED") {
        return res.status(409).json({
            message: "This transaction has already been completed."
        });
      }

      if (existingTransaction.status === "FAILED") {
        return res.status(409).json({
            message: "This transaction has already failed. Please retry with a new idempotency key."
        });
      }

      if (existingTransaction.status === "REVERSED") {
        return res.status(409).json({
            message: "This transaction has already been reversed."
         });
       }
   }
        if (
            fromUserAccount.status !== "ACTIVE" ||
            toUserAccount.status !== "ACTIVE"
        ) {
            return res.status(400).json({
                message: "Both accounts must be ACTIVE"
            });
        }

        const balance = await fromUserAccount.getBalance();

        if (balance < amount) {
            return res.status(400).json({
                message: `Insufficient funds. Available balance: ${balance}`
            });
        }
        await session.startTransaction();

        const [transaction] = await Transaction.create(
            [{
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            }],
            { session }
        );

        await Ledger.create(
            [{
                account: fromAccount,
                amount,
                transaction: transaction._id,
                type: "DEBIT"
            }],
            { session }
        );

        await Ledger.create(
            [{
                account: toAccount,
                amount,
                transaction: transaction._id,
                type: "CREDIT"
            }],
            { session }
        );

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();
        const user = await User.findById(req.user.userId);

       await sendTransactionEmail(
           user.email,
           user.name,
           amount,
           fromAccount,
           toAccount
        );

        return res.status(201).json({
            message: "Transaction created successfully",
            transaction
        });

    } catch (err) {
    if (session.inTransaction()) {
        await session.abortTransaction();
    }

    return res.status(500).json({
        message: "Another transaction is still in progress!!",
        error: err.message
    });
    } finally {
        await session.endSession();
    }
};

export { createInitialFundsTransaction, createTransaction };