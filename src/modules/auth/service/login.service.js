import { OAuth2Client } from 'google-auth-library';
import {providerTypes, userModel} from "../../../DB/model/User.model.js";
import { roleTypes } from '../../../middleware/auth.middleware.js';
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from '../../../utils/response/success.response.js';
import {  decodeToken, generateToken2, tokenTypes } from "../../../utils/token/token.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import * as dbService from '../../../DB/db.service.js';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signIn = errorAsyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body;

        const user = await dbService.findOne({
            model: userModel,
            filter: { email },
        });

        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if (!user.confirmEmail) {
            return next(new Error("User email not confirmed", { cause: 401 }));
        }

        if (user.provider !== providerTypes.system) {
            return next(new Error("Invalid provider type", { cause: 403 }));
        }

        if (user.bannedAt) {
            return next(new Error("User is banned", { cause: 403 }));
        }

        if (user.deleted) {
            return next(new Error("User account is deleted", { cause: 403 }));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new Error("In_valid account password not match" , { cause: 404 }));
        }

        user.deleted = false;
        user.changeCredentialsTime = Date.now();
        await user.save();

        const accessToken = generateToken2({
            payload: { id: user._id, isLoggedIn: true },
            signature:
                user.role === roleTypes.Admin
                    ? process.env.SYSTEM_ACCESS_TOKEN
                    : process.env.USER_ACCESS_TOKEN,
            options: { expiresIn: "1h" },
        });

        const refreshToken = generateToken2({
            payload: { id: user._id, isLoggedIn: true },
            signature:
                user.role === roleTypes.Admin
                    ? process.env.SYSTEM_REFRESH_TOKEN
                    : process.env.USER_REFRESH_TOKEN,
            options: { expiresIn: "7d" },
        });

        return successResponse({
            res,
            message: "Welcome User to your account (login)",
            status: 200,
            data: {
                token: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    }
);

export const login = errorAsyncHandler(
    async (req, res, next) => {

        const { email , password} = req.body;
        
        const user = await dbService.findOne({
            model: userModel,
            filter: {email}
        });

        if(!user){
            return next(new Error("In_valid account user not found" , {cause: 404}));
        }
        if(!user.confirmEmail){
            return next(new Error("In_valid account user not confirmEmail" , {cause: 401}));
        }
        const match = compareHash({
            plainText: password,
            hashValue: user.password
        }) // match password and hash password   // password to frontend and hash password to DB
        
        if(!match){
            return next(new Error("In_valid account password not match" ,{cause: 404}));
        }
        
        user.deleted = false;
        user.changeCredentialsTime = Date.now();
        await user.save();
        
        
        const accessToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role ===  roleTypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN 
        })
        const refreshToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role === roleTypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN ,
            options: {expiresIn: process.env.SYSTEM_EXPIREINTOKEN}
        })
        return successResponse({ res, message:"Welcome User to your account (login)", status:200 ,
            data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }
        });
    }
);


export const refreshToken = errorAsyncHandler(
    async (req , res , next) => {
        
        const user = await decodeToken({authorization: req.headers.authorization , tokenType: tokenTypes.refresh , next})

        const accessToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role ===  roleTypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN 
        })
        const refreshToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role === roleTypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN ,
            options: {expiresIn: process.env.SYSTEM_EXPIREINTOKEN}
        })

        return successResponse({ res, message:"Welcome User to your account (refresh token success)", status:200 ,
            data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }
        });

    }
);


// export const googleLogin = errorAsyncHandler(async (req, res, next) => {
//     const { token } = req.body;

//     const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: process.env.GOOGLE_CLIENT_ID
//     });

//     const payload = ticket.getPayload();

//     const { sub: googleId, email, name } = payload;


//     let user = await dbService.findOne({
//         model: userModel,
//         filter: { googleId, provider: providerTypes.google }
//     });

//     if (!user) {

//         const existingUser = await dbService.findOne({
//             model: userModel,
//             filter: { email }
//         });

//         if (existingUser) {
//             return next(new Error("Email is already registered with another provider.", { cause: 409 }));
//         }

//         user = await dbService.create({
//             model: userModel,
//             data: {
//                 userName: name,
//                 email,
//                 googleId,
//                 confirmEmail: true,
//                 provider: providerTypes.google,
//                 role: roleTypes.User
//             }
//         });
//     }

//     user.deleted = false;
//     user.changeCredentialsTime = Date.now();
//     await user.save();

//     const accessToken = generateToken2({
//         id: user._id,
//         role: user.role,
//         isLoggedIn: true,
//         options: { expiresIn: '1h' }
//     });

//     const refreshToken = generateToken2({
//         id: user._id,
//         role: user.role,
//         isLoggedIn: false,
//         options: { expiresIn: '7d' }
//     });

//     return successResponse({
//         res,
//         message: "Welcome, successfully logged in with Google.",
//         status: 200,
//         data: {
//             user: {
//                 id: user._id,
//                 userName: user.userName,
//                 email: user.email,
//                 provider: user.provider
//             },
//             token: {
//                 accessToken,
//                 refreshToken
//             }
//         }
//     });
// });
