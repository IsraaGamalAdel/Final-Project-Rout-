import * as dbService from '../../../DB/db.service.js';
import { userModel } from '../../../DB/model/User.model.js';
import { errorAsyncHandler } from '../../../utils/response/error.response.js';
import { successResponse } from '../../../utils/response/success.response.js';
import { compareHash, generateHash } from '../../../utils/security/hash.security.js';
import { emailEvent } from '../../../utils/events/sendEmailEvent.js';
import { timeCodeOTP } from '../../../middleware/timeCode.middleware.js';


// forgot password OTP

export const forgotPasswordOTP = errorAsyncHandler(
    async (req , res , next) => {
        const {email} = req.body;

        const user = await dbService.findOne({
            model: userModel,
            filter: {
                email,
                $or: [
                    { deleted: { $exists: false } }, 
                    { deleted: false }
                ]
            }
        });

        if(!user){
            return next(new Error("In_valid account user not found" , {cause: 404}));
        } 

        emailEvent.emit("sendCodeOTP" ,{id: user._id , email});

        return successResponse({res , message: "verification code sent to your email" , status:200});
    }
);


export const resetPasswordOTP = errorAsyncHandler(
    async (req, res, next) => {
        const { email, code, password, confirmPassword } = req.body;
        
        // const user = await userModel.findOne({ email });
        const user = await dbService.findOne({
            model: userModel,
            filter: {
                email,
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: false }
                ]
            }
        });
        
        if (!user) {
            return next(new Error("Invalid account: user not found", { cause: 404 }));
        }

        // code expired
        await timeCodeOTP(user , code , 'forgotPasswordOTP');

        if (password !== confirmPassword) {
            return next(new Error("Password and confirmPassword do not match", { cause: 400 }));
        }

        const isPasswordMatch = compareHash({ plainText: password , hashValue: user.password});
        if(isPasswordMatch){
            return next(new Error(`New password match exist password , please password to page login` ,{cause: 400}));
        }

        const hashPassword = generateHash({ plainText: password });

        await dbService.updateOne({
            model: userModel,
            filter: { email },
            data: { password: hashPassword, confirmEmail: true, changeCredentialsTime: Date.now(),
                $unset: {
                    forgotPasswordOTP: 1,
                    otpExpiresAt: 1,
                    otpAttempts: 1,
                    otpBlockedUntil: 1
                }
            },
            // options: { new: true }
        })

        return successResponse({ res, message: "Reset Password Successfully", status: 200 });
    }
);


        