import { verifyJWTs } from "./verfiJWTs.js";

export const verifyRoles = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role) {
            res.status(403).json("you cannot access this resource");
        }
        else{
            next();
        }
    }
}