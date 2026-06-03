import mongoose from "mongoose";
import Account from "../models/account.models.js";

const createAccount = async(req,res)=>{
    const account=await Account.create({
        user:req.user.userId,
    })
    res.status(201).json({
        message:"account created successfully",
        account:account
    })

}
const getAccounts=async(req,res)=>{
    const accounts = await Account.find({
        user: req.user.userId
    });
    res.status(200).json({
        message: "Accounts retrieved successfully",
        accounts: accounts
    });
}
const getBalance = async (req,res)=>{
    const accountId= req.params.accountId;
    const account = await Account.findOne({
        _id: accountId,
        user: req.user.userId
    });

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        });
    }

    res.status(200).json({
        message: "Balance retrieved successfully",
        accountId: account._id,
        balance: await account.getBalance()
    });
}
export {createAccount,getAccounts,getBalance};