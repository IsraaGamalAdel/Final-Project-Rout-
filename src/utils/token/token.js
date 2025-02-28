import jwt from "jsonwebtoken";
import { userModel } from "../../DB/model/User.model.js";
import * as dbService from "../../DB/db.service.js";



export const tokenTypes ={
    access: "access",
    refresh: "refresh"
};


export const decodeToken = async ({ authorization = "", tokenType = tokenTypes.access, next, originalUrl }) => {
    const [bearer, token] = authorization?.split(" ") || [];
    if (!bearer || !token) {
        return next(new Error("Not Authorized Access or invalid token", { cause: 400 }));
    }

    let accessSignature = "";
    let refreshSignature = "";
    switch (bearer) {
        case "System":
            accessSignature = process.env.SYSTEM_ACCESS_TOKEN;
            refreshSignature = process.env.SYSTEM_REFRESH_TOKEN;
            break;
        case "Bearer":
            accessSignature = process.env.USER_ACCESS_TOKEN;
            refreshSignature = process.env.USER_REFRESH_TOKEN;
            break;
        default:
            return next(new Error("Invalid token type", { cause: 401 }));
    }

    const decoded = verifyToken2({ token, signature: tokenType === tokenTypes.access ? accessSignature : refreshSignature });
    if (!decoded?.id) {
        return next(new Error("Invalid token", { cause: 401 }));
    }


    const userFilter = { _id: decoded.id };
    if (originalUrl !== "/users/profile/restore_account") {
        userFilter.deleted = false;
    }

    const user = await dbService.findOne({
        model: userModel,
        filter: userFilter,
    });

    if (!user) {
        return next(new Error("Invalid account user not found", { cause: 404 }));
    }

    const tolerance = 5000; 
    if (
        originalUrl !== "/users/profile/restore_account" &&
        user.changeCredentialsTime?.getTime() >= decoded.iat * 1000 + tolerance
    ) {
        return next(new Error("Expired Token: Credentials have changed", { cause: 400 }));
    }

    return user;
};


export const generateToken2 = ({payload={} , signature = process.env.USER_ACCESS_TOKEN, expiresIn=parseInt(process.env.USER_EXPIREINTOKEN)} = {}) => {
    const token = jwt.sign(payload , signature, {expiresIn} )
    return token;
};


export const verifyToken2 = ({token = "" , signature = process.env.USER_ACCESS_TOKEN} = {}) => {
    const decoded = jwt.verify(token , signature)
    return decoded;
};


