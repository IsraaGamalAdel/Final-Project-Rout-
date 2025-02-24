import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/User.model.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";


export const blockUser = errorAsyncHandler(
    async (req, res, next) => {
        const { email } = req.body;

        if (!email) {
            return next(new Error("Email is required", { cause: 400 }));
        }

        const userToBlock = await dbService.findOne({ model: userModel, filter: { email } });
        if (!userToBlock) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if (req.user._id.toString() === userToBlock._id.toString()) {
            return next(new Error("You cannot block yourself", { cause: 400 }));
        }

        const user = await userModel.findById(req.user._id);

        if (user.blockedUsers.includes(userToBlock._id)) {
            return next(new Error("User is already blocked", { cause: 400 }));
        }

        user.blockedUsers.push(userToBlock._id);
        await user.save();

        userToBlock.bannedAt = new Date();
        await userToBlock.save();

        return successResponse({ res, message: "User blocked successfully", status: 200 });
    }
);


export const unblockUser = errorAsyncHandler(
    async (req, res, next) => {
        const { email } = req.body;

        const userToUnblock = await dbService.findOne({ model: userModel, filter: { email } });
        if (!userToUnblock) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if (req.user._id.toString() === userToUnblock._id.toString()) {
            return next(new Error("You cannot unblock yourself", { cause: 400 }));
        }

        const user = await userModel.findById(req.user._id);

        if (!user.blockedUsers.includes(userToUnblock._id)) {
            return next(new Error("User is not blocked", { cause: 400 }));
        }

        user.blockedUsers = user.blockedUsers.filter(
            (id) => id.toString() !== userToUnblock._id.toString()
        );
        await user.save();

        userToUnblock.bannedAt = null;
        await userToUnblock.save();

        return successResponse({ res, message: "User unblocked successfully", status: 200 });
    }
);



export const bannedUser = errorAsyncHandler(
    async (req, res, next) => {
        const { email } = req.body;
    
        if (!email) {
            return next(new Error("Email is required", { cause: 400 }));
        }
    
        const userToBlock = await dbService.findOne({ model: userModel, filter: { email } });
        if (!userToBlock) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if (req.user._id.toString() === userToBlock._id.toString()) {
            return next(new Error("You cannot block yourself", { cause: 400 }));
        }
    
        const isBlocked = req.user.blockedUsers?.includes(userToBlock._id);
    
        if (userToBlock.bannedAt) {
            await dbService.findByIdAndUpdate({
                model: userModel,
                id: userToBlock._id,
                data: { bannedAt: null, updatedBy: req.user._id },
                options: { new: true , runValidators: true},
            });
    
            await dbService.findByIdAndUpdate({
                model: userModel,
                id: req.user._id,
                data: { $pull: { blockedUsers: userToBlock._id } },
                options: { new: true },
            });
    
            return successResponse({ res, message: "User unbanned successfully", status: 200 });
        } else {
            await dbService.findByIdAndUpdate({
                model: userModel,
                id: userToBlock._id,
                data: { bannedAt: new Date(), updatedBy: req.user._id },
                options: { new: true },
            });
    
            if (!isBlocked) {
                await dbService.findByIdAndUpdate({
                    model: userModel,
                    id: req.user._id,
                    data: { $addToSet: { blockedUsers: userToBlock._id } },
                    options: { new: true },
                });
            }
    
            return successResponse({ res, message: "User banned successfully", status: 200 });
        }
    }
);
