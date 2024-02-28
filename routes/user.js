const { Router } = require("express");
const z = require('zod');
const {User, Account} = require("../db")
const { JWT_SECRETE } = require("../config");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middlewares/auth");


const router = Router();

const signUpBody = z.object({
    username : z.string().email(),
    password : z.string(),
    firstName : z.string(),
    lastName : z.string(),
})

router.post("/signup", async (req, res) => {
    // const input = {
    //     username : req.body.username,
    //     password : req.body.password,
    //     firstName : req.body.firstName,
    //     lastName : req.body.lastName
    // }
    // const pass = signUpBody.safeParse(input);
    // if(pass.success){
    //     const user = await User.findOne({username});
    //     if(user){
    //         await User.create(input);
    //         return res.status(200).json({
    //             message : "User created successfully",
    //             userId : user._id
    //         })
    //     }
    // }
    // return res.status(411).json({
    //     message : "Email already taken / Incorrect inputs"
    // })

    const { success } = signUpBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message : "Email already taken / Incorrect inputs"
        })
    }
    const existingUser = await User.findOne({
        username : req.body.username
    })
    if(existingUser){
        return res.status(411).json({
            message : "Email already taken / Incorrect inputs"
        })
    }
    const user = await User.create({
        username : req.body.username,
        password : req.body.password,
        firstName : req.body.firstName,
        lastName : req.body.lastName
    })
    const userId = user._id
    await Account.create({
        userId,
        balance : Math.ceil(Math.random() * 10000)
    })
    const token = jwt.sign({
        userId
    }, JWT_SECRETE)
    res.json({
        message : 'User created successfully',
        token
    })
})


const signInBody = z.object({
    username : z.string().email(), 
    password : z.string(),
})
router.post("/signin", async (req, res) => {
    const { success } = signInBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message : "Incorrect inputs"
        })
    }
    const user = await User.findOne({
        username : req.body.username,
        password : req.body.password
    })
    if(user){
        const userId = user._id;
        const token = jwt.sign({
            userId
        }, JWT_SECRETE)
        return res.status(200).json({
            token,
        })
    }
    res.status(411).json({
        message : "Error while logging in"
    })
})

const updateSchema = z.object({
    password : z.string().optional(),
    firstName : z.string().optional(),
    lastName : z.string().optional()
})
router.put("/", authMiddleware, async (req, res)=>{
    const { success } = updateSchema.safeParse(req.body)
    if(!success){
        return res.status(401).json({
            message: "Error while updating information"
        })
    }
    await User.updateOne({
        _id : req.userId
    },{
        $set: {
            password : req.body.password,
            firstName : req.body.firstName,
            lastName : req.body.lastName
        }
    })
    res.status(200).json({
        message : "updated successfully"
    })
})

router.get("/bulk",authMiddleware, async (req, res) => {
    const filter = req.query.filter || '';
    // const users = await User.find({
    //     $or : [{
    //         firstName : {
    //             "$regex" : filter
    //         }
    //     },{
    //         lastName : {
    //             "$regex" : filter
    //         }
    //     }]
    // })

    // console.log(req.userId);
    const users = await User.find({
        _id : {
            $ne : {
                _id : req.userId,
            }
        },
        $or : [{
            firstName : {
                '$regex' : filter
            }
        },{
            lastName : {
                '$regex' : filter
            }
        }]
    });

    res.json({
        users : users.map((user) => ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName,
            userId : user._id,
        }))
    })
})

module.exports = router;