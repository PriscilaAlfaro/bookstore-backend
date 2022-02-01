/* eslint-disable camelcase */
const express = require('express');
const Users = require('../models/users');
// const { authenticateUser } = require('../auth/auth');
const bcrypt = require('bcrypt-nodejs');

const userRouter = express.Router();

// middleware to catch the id param
userRouter.param('id', async (req, res, next, id) => {
    try {
        const userId = id;
        if (!userId || userId === null) {
            return res.status(404).send('Id does not exist')
        } else {
            const result = await Users.findById(userId);
            if (result === null || !result) {
                res.status(404).json({ response: 'Id does not exist', success: false });
            } else {
                req.userById = result;
                next();
            }
        }
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ response: "Bad id request", success: false });
        } else {
            return res.status(500).json({ response: error.message, success: false });
        }
    }
})


//register a new user 
userRouter.post('/signup', async (req, res) => {

    const { username, email, password } = req.body;
    console.log("req.body", req.body)

    try {
        const salt = bcrypt.genSaltSync();

        if (password.length < 5) {
            throw "Password must be at least 5 characters long"
        }

        const user = await new Users({
            username,
            email,
            password: bcrypt.hashSync(password, salt),
        }).save();

        res.status(201).json({
            response: {
                id: user._id,
                username: user.username,
                email: user.email,
                accessToken: user.accessToken
            },
            success: true,
        });
    } catch (error) {
        res.status(400).json({
            response: error, id: "from /signup", success: false,
        });
    }
})

//user signin
userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email })
        if (user && bcrypt.compareSync(password, user.password)) {
            res.status(200).json(
                {
                    response: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        accessToken: user.accessToken
                    },
                    success: true,
                })
        } else {
            //user does not exist
            //encripted password does not match
            res.status(404).json({ response: "Email or password doesn't match", success: false })
        }
    } catch (error) {
        res.status(500).json({ errors: error });
    }
})


userRouter.get('/', async (req, res) => {
    try {
        const { limit } = req.query || 20;
        const users = await Users.find().limit(+limit);
        if (users) {
            res.status(200).json({ response: users, success: true });
        } else {
            res.status(404).json({ response: 'No results', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})


userRouter.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ response: req.userById, success: true });
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

// should send all body
userRouter.put('/:id', async (req, res) => {
    const { body } = req
    try {
        const userUpdated = await Users.updateOne({ _id: req.userById }, body);
        if (userUpdated.nModified > 0) {
            res.status(200).json({ response: body, success: true });
        } else {
            res.status(404).json({ response: 'No updated', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

// update just one value of the object
userRouter.patch('/:id', async (req, res) => {
    const { body } = req
    try {
        const userUpdated = await Users.updateOne({ _id: req.userById },
            { $set: body });

        if (userUpdated.nModified > 0) {
            res.status(200).json({ response: body, success: true });
        } else {
            res.status(404).json({ response: 'No updated', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

userRouter.delete('/:id', async (req, res) => {
    try {
        await Users.deleteOne({ _id: req.userById });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

userRouter.post('/', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            // isAdmin,
        } = req.body;

        if (
            username &&
            email &&
            password
            // && (isAdmin === false || isAdmin)
        ) {
            const user = new Users({ ...req.body })
            const savedUser = await user.save();
            res.status(200).json({ response: savedUser, success: true });
        } else {
            return res.status(400).json({ response: "Bad request", success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

module.exports = userRouter;