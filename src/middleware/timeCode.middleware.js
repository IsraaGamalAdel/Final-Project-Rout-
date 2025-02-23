import { compareHash } from "../utils/security/hash.security.js";
import { userModel } from './../DB/model/User.model.js';
import * as dbService from '../DB/db.service.js';



const codeOTP = async (user, code, otpType) => {
    // check user is code blocked
    if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) {
        const remainingTime = Math.ceil((user.otpBlockedUntil - Date.now()) / 60000);
        throw new Error(`Too many failed attempts. Please try again in ${remainingTime} minutes`, { cause: 400 });
    }

    // code expired
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
        if (new Date() > user.otpExpiresAt) {
            await dbService.updateOne({
                model: userModel,
                filter: { email: user.email },
                data: {
                    $unset: { emailOTP: 1, forgotPasswordOTP: 1 ,otpExpiresAt: 1, otpBlockedUntil: 1, otpAttempts: 1 },
                }
            });

            throw new Error("OTP expired", { cause: 400 });
        }
    }

    if (!compareHash({ plainText: code, hashValue: user[otpType] })) {
        const counterOtpAttempts = (user.otpAttempts || 0) + 1;

        if (counterOtpAttempts >= 5) {
            await dbService.updateOne({
                model: userModel,
                filter: { _id: user._id },
                data: {
                    otpBlockedUntil: new Date(Date.now() + 5 * 60000),
                    otpAttempts: 0
                }
            });
            throw new Error("Too many failed attempts. Please try again in 5 minutes.", { cause: 400 });
        }

        await dbService.updateOne({
            model: userModel,
            filter: { _id: user._id },
            data: { otpAttempts: counterOtpAttempts }
        });

        throw new Error(
            `Invalid OTP code, please check code to email, Attempts remaining: ${counterOtpAttempts - 0} / 5 `,
            { cause: 400 }
        );
    }

    await dbService.updateOne({
        model: userModel,
        filter: { _id: user._id },
        data: { otpAttempts: 0 }
    });
};


export const timeCodeOTP = async (user, code, otpType) => {
    await codeOTP(user, code, otpType);
};