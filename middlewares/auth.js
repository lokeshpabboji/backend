const jwt = require('jsonwebtoken');
const {JWT_SECRETE} = require('../config');

const authMiddleware = (req, res, next) => {
    const Btoken = req.headers.authorization;
    if (!Btoken || !Btoken.startsWith('Bearer ')) {
        return res.status(403).json({message : 'not a valid token'});
    }
    const token = Btoken.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRETE);
        req.userId = decoded.userId
        next();
    } catch (error) {
        res.status(403).json("incorrect inputs")
    }
}

module.exports = {
    authMiddleware
}