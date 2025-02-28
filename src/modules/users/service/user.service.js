import * as dbService from "../../../DB/db.service.js";
import {userModel} from "../../../DB/model/User.model.js";
import { errorAsyncHandler } from './../../../utils/response/error.response.js';
import { decodeEncryption, generateEncryption } from './../../../utils/security/encryption.security.js';
import { successResponse } from './../../../utils/response/success.response.js';
import { compareHash, generateHash } from './../../../utils/security/hash.security.js';
import { emailEvent } from './../../../utils/events/sendEmailEvent.js';
import cloudinary from './../../../utils/multer/cloudinary.js';
import { timeCodeOTP } from './../../../middleware/timeCode.middleware.js';



export const getLoginUserAccountData  = errorAsyncHandler(
    async (req , res , next) => {

        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: req.user._id },
            select: '-__v -password -deleted  -confirmEmail',
            populate: [
                {
                    path: "friends" , select: "firstName lastName email profilePic"
                }
            ]
        })

        if(!user){
            return next(new Error("In_valid account user not found" , {cause: 404}));
        }

        // user.phone = decodeEncryption({ cipherText: user.phone});
        user.phone = user.getDecryptedMobile();

        const userData = user.toObject();
        if (userData.id) {
            delete userData.id;
        }

        return successResponse({ 
            res, message: "Welcome User to your account (profile)" ,
            status:200 , 
            data: {users: userData}
        });
    }
);


export const GetProfileDataForAnotherUser = errorAsyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;

        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: userId },
            select: 'firstName lastName phone profilePic coverPic'
        });

        if (!user) {
            return next(new Error("Invalid account user not found", { cause: 404 }));
        }

        user.phone = decodeEncryption({ cipherText: user.phone});

        const userData = user.toObject();

        delete userData.id;
        delete userData._id;

        return successResponse({
            res,
            message: "User profile data retrieved successfully.",
            status: 200,
            data: { user: userData }
        });
    }
);

export const updateUserAccount = errorAsyncHandler(
    async (req, res, next) => {

        if (req.body.phone) {
            req.body.phone = generateEncryption({ plainText: req.body.phone });
        }

        // const allowedUpdates = ['phone', 'DOB', 'firstName', 'lastName', 'gender'];
        // const updateData = {};

        // allowedUpdates.forEach((field) => {
        //     if (req.body[field] !== undefined) {
        //         updateData[field] = req.body[field];
                
        //     }
        // });

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: req.body,
            select: '-__v -password -deleted  -confirmEmail',
            options: { new: true, runValidators: true },
        });

        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }

        const userObject = user.toObject();
        delete userObject.id;

        return successResponse({
            res,
            message: "Welcome User to your account (Update profile)",
            status: 200,
            data: { user : userObject  },
        });
    }
);


export const UpdatePassword = errorAsyncHandler(
    async (req , res , next) => {
        const {oldPassword , password} = req.body;

        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: req.user._id }
        });

        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if(!compareHash({plainText: oldPassword , hashValue: req.user.password})){
            return next(new Error("In_valid account user old password not match " ,{cause: 400}));
        }

        const hashPassword = generateHash({plainText: password});

        await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {password: hashPassword , changeCredentialsTime: Date.now()},
            options: {new: true , runValidators: true}
        })

        return successResponse({ res, message: "Welcome User to your account ( Update password to profile)" , status:200 });
    }
);

// Update Email
export const UpdateEmail = errorAsyncHandler(
    async (req , res , next) => {
        const {email} = req.body;

        if( await dbService.findOne({model: userModel, filter: {email}})){
            return next(new Error(`Email ${email} already exist` , {cause: 409}));
        }

        await dbService.updateOne({
            model: userModel,
            filter: {_id: req.user._id},
            data: {
                tempEmail: email
            }
        })
        emailEvent.emit("sendUpdateEmail" , {id: req.user._id ,email})  //send code to email the new account
        emailEvent.emit("sendConfirmEmail" , {id: req.user._id ,email: req.user.email})  // send code to old account

        return successResponse({ res, message: "Welcome User to your account ( Update password to profile)" , status:200 });
    }
);


export const replaceEmail = errorAsyncHandler(
    async (req , res , next) => {
        const { oldEmailCode , code} = req.body;

        const user = await dbService.findOne({ model: userModel, filter: { _id: req.user._id } });

        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if( await dbService.findOne({model: userModel, filter: {email: req.user.tempEmail}})){
            return next(new Error(`Email ${email} already exist` , {cause: 409}));
        }

        await timeCodeOTP(user, oldEmailCode, 'emailOTP');

        await timeCodeOTP(user, code, 'updateEmailOTP');

        await dbService.updateOne({
            model: userModel,
            filter: {_id: req.user._id},
            data: {
                email: req.user.tempEmail,
                changeCredentialsTime: Date.now(),
                $unset: {
                    tempEmail: 0,
                    updateEmailOTP: 0,
                    emailOTP: 0
                }
            }
        })

        return successResponse({ res, message: "Welcome User to your account ( Update email to profile)" , status:200 });
    }
);


// Update Image
export const updateImage = errorAsyncHandler(
    async (req, res, next) => {

        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `users/${req.user._id}`,
        });

        const currentUser = await userModel.findById(req.user._id);

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                profilePic: { secure_url, public_id },
            },
            options: { new: true, runValidators: true },
        });

        if (currentUser?.profilePic?.public_id) {
            await cloudinary.uploader.destroy(currentUser.profilePic.public_id);
        }

        return successResponse({
            res,
            message: "Welcome User to your account (Update images)",
            data: { user },
        });
    }
);


// Delete Image
export const deleteImage = errorAsyncHandler(
    async (req, res, next) => {
        const { public_id } = req.body;

        const deleteResult = await cloudinary.uploader.destroy(public_id);

        if (deleteResult.result !== "ok") {
            return next(new Error("Failed to delete image from Cloudinary"));
        }

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                $unset: { profilePic: 0 },
            },
            options: { new: true, runValidators: true }, 
        });

        if (!user) {
            return next(new Error("User not found"));
        }

        return successResponse({
            res,
            message: "Profile image deleted successfully.",
            data: { user },
        });
    }
);


// Update Cover Images
export const coverImages = errorAsyncHandler(
    async (req , res , next) => {

        const images = [];

        for (const file of req.files){
            const {secure_url , public_id} = await cloudinary.uploader.upload(file.path , 
                { folder: `users/${req.user._id}/coverImages`}
            );

            images.push({secure_url , public_id})
        }

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: { coverPic: images},
            options: {new: true}
        })
        
        return successResponse({ res, message: "Welcome User to your account ( Update profile)" , 
            data: {
                file: req.files,
                user
            }
        });
    }
);


// Delete cover images (one or all)
export const deleteCoverImages = errorAsyncHandler(
    async (req, res, next) => {
        const { public_id } = req.body;

        const user = await userModel.findById(req.user._id);
        if (!user) {
            return next(new Error("User not found"));
        }

        if (!user.coverPic || user.coverPic.length === 0) {
            return next(new Error("No images to delete."));
        }

        if (!public_id || public_id === "all") {
            for (const image of user.coverPic) {
                await cloudinary.uploader.destroy(image.public_id);
            }

            user.coverPic = [];
        } else {
            const imageToDelete = user.coverPic.find(img => img.public_id === public_id);

            if (!imageToDelete) {
                return next(new Error("Image not found."));
            }

            await cloudinary.uploader.destroy(public_id);

            user.coverPic = user.coverPic.filter(img => img.public_id !== public_id);
        }

        await user.save();

        return successResponse({
            res,
            message: public_id === "all" ? "All cover images deleted successfully." : "Cover image deleted successfully.",
            data: { user },
        });
    }
);


// Soft Delete Account
export const SoftDeleteAccount = errorAsyncHandler(
    async (req, res, next) => {

        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            {
                deleted: true,
                changeCredentialsTime: Date.now(),
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new Error("User not found"));
        }

        return successResponse({
            res,
            message: "Soft Delete Account User Successfully",
            status: 200,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    deleted: user.deleted,
                },
            },
        });
    }
);


// Restore Account
export const restoreAccount = errorAsyncHandler(
    async (req, res, next) => {
        const { email } = req.body; 
        
        const user = await userModel.findOne({ email });

        if (!user) {
            return next(new Error("User not found."));
        }

        if (!user.deleted) {
            return next(new Error("Account is already active."));
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            {
                deleted: false,
                changeCredentialsTime: null,
            },
            { new: true, runValidators: true }
        );

        return successResponse({
            res,
            message: "Account restored successfully.",
            status: 200,
            data: { user: updatedUser },
        });
    }
);






export const addFriends = errorAsyncHandler(
    async(req ,res , next) => {
        const {friendId} = req.params;

        const friend = await dbService.findOneAndUpdate({
            model: userModel,
            filter: {_id: friendId, deleted: {$exists: false} } ,
            data: {
                $addToSet: { friends: req.user._id}
            },
            options: {new: true}
        })

        if (!friend) {
            return next(new Error("User not found" , {cause: 404}));
        }

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                $addToSet: { friends: friendId}
            },
            options: {new: true}
        })
        return successResponse({ res, message: "Add Friend Successfully" , 
            data: {
                user
            }
        });
    }
);