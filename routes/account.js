const {Router} = require('express');
const router = Router();
const {Account, User} = require("../db");
const { authMiddleware } = require('../middlewares/auth');
const { startSession } = require('mongoose');


router.get("/balance",authMiddleware, async (req, res) => {
    const acc = await Account.findOne({
        userId : req.userId
    })
    res.status(200).json({
        balance : acc.balance
    })
});

router.post("/transfer", authMiddleware, async (req, res) => {
    // bad solution without using transactions in mongoose
    // const fromUserId = req.userId;
    // const {amount, to} = req.body;
    // const fromAcc = await Account.findOne({fromUserId})
    
    // if(fromAcc.balance < amount){
    //     return res.status(404).json({
    //         message : "Insufficient balance"
    //     })
    // }
    // const toAccount = await Account.findOne({
    //     userId : to
    // })
    // if(!toAccount){
    //     return res.status(404).json({
    //         message : "Invalid account"
    //     })
    // }
    // await Account.updateOne(fromUserId, {
    //     $inc : {
    //         balance : -amount
    //     }
    // })
    // await Account.updateOne(to,{
    //     $inc : {
    //         balance : amount
    //     }
    // })
    // res.status(200).json({
    //     message : "Transfer successful"
    // })
    
    const session = await startSession();
    session.startTransaction();
    

    const {amount , to} = req.body;
    const fromAcc = await Account.findOne({userId : req.userId}).session(session);
    // we don't need to check for !fromAcc cause we are already checking it in authMiddleware
    if(fromAcc.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message : "Insufficient balance"
        });
    }
    const toAcc = await Account.findOne({userId : to}).session(session);
    if(!toAcc){
        await session.abortTransaction();
        return res.status(400).json({
            message : "Invalid account"
        })
    }
    await Account.updateOne({userId : req.userId}, {$inc : {balance : -amount}}).session(session);
    await Account.updateOne({userId : to}, {$inc : {balance : amount}}).session(session);
    await session.commitTransaction();
    res.json({
        message : "Transfer successful",
        balance : fromAcc.balance - amount
    })
})

module.exports = router;