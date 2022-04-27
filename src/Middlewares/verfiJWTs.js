import Jwt from "jsonwebtoken";
import dotenv from 'dotenv/config';

export const verifyJWTs = (req, res, next) => {
    try {
        const authHeader = req.headers["auth-token"]
        if(!authHeader) return res.status(401).json({"message": "you should provide a token"})
        const token = authHeader.split(" ")[1]
        const user = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err) return res.status(403).json("access denied");
            req.user = decoded.userInfo;
            next();
        })
    } catch (error) {
        res.status(500).json(error.message)
    }
}