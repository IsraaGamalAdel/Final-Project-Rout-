import { errorAsyncHandler } from "../utils/response/error.response.js";
import { decodeToken } from '../utils/token/token.js';

export const roleTypes = {
    User : "User" , 
    Admin : "Admin",
    SuperAdmin: "SuperAdmin",
    HR : "HR"
};


// export const authentication = () => {
//     return errorAsyncHandler(
//         async (req , res , next) => {
//             req.user = await decodeToken ({authorization: req.headers.authorization , next });  
//             return next();
//         }
//     )
// };



export const authentication = () => {
    return errorAsyncHandler(
        async (req, res, next) => {
            req.user = await decodeToken({
                authorization: req.headers.authorization,
                next,
                originalUrl: req.originalUrl,
            });
            return next();
        }
    );
};


export const authorization = (accessRoles = []) => {
    return errorAsyncHandler(
        async (req , res , next ) => {
            console.log({accessRoles , user: req.user.role , match:accessRoles.includes(req.user.role) == false});
            
            if(!accessRoles.includes(req.user.role)){
                return next(new Error("Not Authorized Access" , {cause: 403}));
            } 
            return next();
        }
    )
};
