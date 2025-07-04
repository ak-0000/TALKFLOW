import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try{
    const token = req.cookies.jwt
    if(!token){
        return res.status(401).send("Unauthorized, no token provided");
    }

    const decoded = jwt.verify(token, process.env.JWTSECRET);
    if(!decoded){
        return res.status(401).send("Unauthorized, invalid token");
    }

    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
        return res.status(401).send("Unauthorized, user not found");
    }

    req.user = user;
    next();

    }catch(error){
        console.error("Error in protectRoute middleware:", error);
        return res.status(500).send("Internal server error");
    }


}
