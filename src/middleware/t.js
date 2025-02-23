
throw
const codeOTP1 = async (user, code, otpType) => {
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
                    $unset: { emailOTP: 1, otpExpiresAt: 1, otpBlockedUntil: 1, otpAttempts: 1 },
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

// email
const codeOTP2 = async (user, code, otpType, email) => { // أضف email كمعامل
    // الكود الحالي...

    // code expired
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
        if (new Date() > user.otpExpiresAt) {
            await dbService.updateOne({
                model: userModel,
                filter: { email }, // استخدم email الذي تم تمريره
                data: {
                    $unset: { emailOTP: 1, otpExpiresAt: 1, otpBlockedUntil: 1, otpAttempts: 1 },
                }
            });

            throw new Error("OTP expired", { cause: 400 });
        }
    }

    // الكود الحالي...
};
export const timeCodeOTP = async (user, code, otpType ,email) => {
    await codeOTP(user, code, otpType);
};
export const resetPasswordOTP = errorAsyncHandler(
    async (req, res, next) => {
        const { email, code, password, confirmPassword } = req.body;

        const user = await dbService.findOne({
            model: userModel,
            filter: { email, deleted: { $exists: false } }
        });

        if (!user) {
            return next(new Error("Invalid account: user not found", { cause: 404 }));
        }

        await timeCodeOTP(user, code, 'forgotPasswordOTP', email);

        // الكود الحالي...
    }
);



//Next
const codeOTP3 = async (user, code, otpType , next) => {

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
                filter: {email},
                data: {
                    $unset: {emailOTP: 1, otpExpiresAt: 1, otpBlockedUntil: 1 , otpAttempts: 1},
                    // $set: { otpAttempts: 0 }
                }
            });
            
            return next(new Error("OTP expired", { cause: 400 }));
        }
    }

    if (!compareHash({ plainText: code, hashValue: user[otpType] })) {
        const counterOtpAttempts = (user.otpAttempts || 0) + 1;

        if (counterOtpAttempts >= 5) {
            // dbService
            // 5 minutes block user
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

        // return next(new Error(
        //     `Invalid OTP code. Attempts remaining: ${counterOtpAttempts - 0} , ${5 - counterOtpAttempts}`, 
        //     { cause: 400 }
        // ));

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

export const timeCodeOTP3 = async (user, code, otpType ,next) => {
    await codeOTP(user, code, otpType ,next);
};
export const resetPasswordOTP3 = errorAsyncHandler(
    async (req, res, next) => {
        const { email, code, password, confirmPassword } = req.body;

        const user = await dbService.findOne({
            model: userModel,
            filter: { email, deleted: { $exists: false } }
        });

        if (!user) {
            return next(new Error("Invalid account: user not found", { cause: 404 }));
        }

        await timeCodeOTP(user, code, 'forgotPasswordOTP', next);

        // الكود الحالي...
    }
);

