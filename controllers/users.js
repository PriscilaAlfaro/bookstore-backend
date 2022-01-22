/* eslint-disable camelcase */
const express = require('express');
const Users = require('../models/users');
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
                res.status(404).json({ message: 'Id does not exist', success: "false" });
            } else {
                req.userById = result;
                next();
            }
        }
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Bad id request", success: "true" });
        } else {
            return res.status(500).json({ message: error.message });
        }
    }
})


// const authenticateUser = async (req, res, next) => {

//     try {
//         const user = await User.findOne({ accessToken: req.header('Authorization') })
//         if (user) {
//             next();
//         } else {
//             res.status(401).json({ response: "Please log in", loggetOut: true, success: false })
//         }
//     } catch (error) {
//         res.status(400).json({ errors: error, success: false })
//     }
// }


userRouter.get('/', async (req, res) => {
    try {
        const { limit } = req.query;
        const users = await Users.find().limit(+limit);
        if (users) {
            res.status(200).json({ users: users, success: "true" });
        } else {
            res.status(404).json({ message: 'No results', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


userRouter.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ user: req.userById, success: "true" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// should send all body
userRouter.put('/:id', async (req, res) => {
    const { body } = req
    try {
        const userUpdated = await Users.updateOne({ _id: req.userById }, body);
        if (userUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// update just one value of the object
userRouter.patch('/:id', async (req, res) => {
    const { body } = req
    try {
        const userUpdated = await Users.updateOne({ _id: req.userById },
            { $set: body });

        if (userUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

userRouter.delete('/:id', async (req, res) => {
    try {
        await Users.deleteOne({ _id: req.userById });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

userRouter.post('/', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            isAdmin,
        } = req.body;

        if (
            username &&
            email &&
            password &&
            (isAdmin === false || isAdmin)
        ) {
            const user = new Users({ ...req.body })
            const savedUser = await user.save();
            res.status(200).json({ user: savedUser, success: "true" });
        } else {
            return res.status(400).json({ message: "Bad request", success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

module.exports = userRouter;