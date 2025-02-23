import { OAuth2Client } from 'google-auth-library';
import { errorAsyncHandler } from './errorHandler.js';
import { userModel } from './models/user.model.js';
import { generateToken2 } from './utils/token.js';
import { successResponse } from './utils/response.js';
import { dbService } from './services/dbService.js';
import { authMiddlewareTypes } from './constants/authTypes.js';
import { roleTypes } from './constants/roleTypes.js';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// تسجيل الدخول عبر Google
export const googleLogin = errorAsyncHandler(async (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return next(new Error("Token is required.", { cause: 400 }));
    }

    // التحقق من التوكن واستخراج البيانات
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { sub: googleId, email, name } = payload;

    // التحقق إذا كان المستخدم مسجلًا مسبقًا
    let user = await dbService.findOne({
        model: userModel,
        filter: { googleId, provider: authMiddlewareTypes.providerTypes.google }
    });

    // إذا لم يكن مسجلًا
    if (!user) {
        // تحقق إذا كان البريد الإلكتروني مستخدمًا مع مزود آخر
        const existingUser = await dbService.findOne({
            model: userModel,
            filter: { email }
        });

        if (existingUser) {
            return next(new Error("Email is already registered with another provider.", { cause: 409 }));
        }

        // تسجيل مستخدم جديد
        user = await dbService.create({
            model: userModel,
            data: {
                userName: name,
                email,
                googleId,
                confirmEmail: true,
                provider: authMiddlewareTypes.providerTypes.google,
                role: roleTypes.User
            }
        });
    }

    // تحديث وقت تسجيل الدخول
    user.deleted = false;
    user.changeCredentialsTime = Date.now();
    await user.save();

    // توليد Access و Refresh Tokens
    const accessToken = generateToken2({
        id: user._id,
        role: user.role,
        isLoggedIn: true,
        options: { expiresIn: '1h' }
    });

    const refreshToken = generateToken2({
        id: user._id,
        role: user.role,
        isLoggedIn: false,
        options: { expiresIn: '7d' }
    });

    // إرسال الاستجابة النهائية
    return successResponse({
        res,
        message: "Welcome, successfully logged in with Google.",
        status: 200,
        data: {
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                provider: user.provider
            },
            token: {
                accessToken,
                refreshToken
            }
        }
    });
});


export const googleLogin1 = errorAsyncHandler(
    async (req, res, next) => {
        const { email, userName, googleId } = req.body;
        
        let user = await dbService.findOne({
            model: userModel,
            filter: { googleId, provider: authMiddlewareTypes.providerTypes.google }
        });

        if (!user) {
            const existingUser = await dbService.findOne({
                model: userModel,
                filter: { email }
            });

            if (!existingUser) {
                return next(new Error("User not found with this email", { cause: 404 }));
            }

            if (existingUser.provider !== authMiddlewareTypes.providerTypes.google) {
                return next(new Error("Email is already registered with another provider", { cause: 409 }));
            }

            user = await dbService.update({
                model: userModel,
                filter: { _id: existingUser._id },
                data: {
                    googleId,
                    confirmEmail: true,
                    provider: authMiddlewareTypes.providerTypes.google
                }
            });
        }

        user.deleted = false;
        user.changeCredentialsTime = Date.now();
        await user.save();

        const accessToken = generateToken2({
            id: user._id,
            role: user.role,
            isLoggedIn: true,
            options: { expiresIn: '1h' }
        });

        const refreshToken = generateToken2({
            id: user._id,
            role: user.role,
            isLoggedIn: false,
            options: { expiresIn: '7d' }
        });

        return successResponse({
            res,
            message: "Welcome, successfully logged in with Google.",
            status: 200,
            data: {
                user: {
                    id: user._id,
                    userName: user.userName,
                    email: user.email,
                    provider: user.provider
                },
                token: {
                    accessToken,
                    refreshToken
                }
            }
        });
    }
);



userModel.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const saltRounds = parseInt(process.env.SALT_ROUND) || 10; // تأكيد أنها رقم
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});