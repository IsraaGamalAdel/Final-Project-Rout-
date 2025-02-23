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












import bcrypt from "bcryptjs";
import { userModel } from "../models/userModel.js";
import { errorAsyncHandler } from "../utils/errorHandler.js";
import { dbService } from "../services/dbService.js";
import { successResponse } from "../utils/successResponse.js";
import crypto from "crypto";
import { emailEvent } from "../events/emailEvent.js";

const encryptPhone = (phone) => {
    const secretKey = process.env.SECRET_KEY || "defaultSecretKey";
    const iv = crypto.randomBytes(16); // Initialization Vector
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey), iv);
    let encrypted = cipher.update(phone, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
};

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

// 🧑‍💻 التسجيل وإنشاء حساب جديد
export const signup = errorAsyncHandler(async (req, res, next) => {
    const { userName, email, password, confirmPassword, phone } = req.body;

    // ✅ التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
        return next(new Error("Password and confirm password do not match.", { cause: 400 }));
    }

    // ✅ التحقق من وجود البريد الإلكتروني مسبقًا
    if (await dbService.findOne({ model: userModel, filter: { email } })) {
        return next(new Error("User already exists.", { cause: 409 }));
    }

    // ✅ التحقق من صحة رقم الهاتف (اختياري)
    if (!/^\+?\d{10,15}$/.test(phone)) {
        return next(new Error("Invalid phone number format.", { cause: 400 }));
    }

    // 📞 تشفير رقم الهاتف
    const encryptedPhone = encryptPhone(phone);

    // 🛠️ إنشاء المستخدم في قاعدة البيانات
    const user = await dbService.create({
        model: userModel,
        data: { userName, email, password, phone: encryptedPhone },
    });

    // 📧 إرسال بريد إلكتروني لتأكيد الحساب
    emailEvent.emit("sendConfirmEmail", { id: user._id, email });

    // ✅ الاستجابة الناجحة
    return successResponse({
        res,
        message: "User successfully created.",
        status: 201,
        data: { userId: user._id },
    });
});
