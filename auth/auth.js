const Users = require('../models/users');

const authenticateUser = async (req, res, next) => {
    try {
        const user = await Users.findOne({ accessToken: req.header('Authorization') })
        if (user) {
            req.user = user;
            console.log(req.user)
            next();
        } else {
            res.status(401).json({ response: "Please log in", loggetOut: true, success: false })
        }
    } catch (error) {
        res.status(400).json({ errors: error, success: false })
    }
}

module.exports = authenticateUser;