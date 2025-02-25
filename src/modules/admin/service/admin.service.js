import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/User.model.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { companyModel } from './../../../DB/model/Company.model.js';
import mongoose from "mongoose";


export const blockUser = errorAsyncHandler(
    async (req, res, next) => {
        const { email } = req.body;

        const userToBlock = await dbService.findOne({ model: userModel, filter: { email } });
        if (!userToBlock) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if (req.user._id.toString() === userToBlock._id.toString()) {
            return next(new Error("You cannot block yourself", { cause: 400 }));
        }

        const user = await dbService.findById({ 
            model: userModel,
            id: req.user._id 
        });

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

        const user = await dbService.findById({
            model: userModel,
            id: req.user._id
        });

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


// ابقى ارجع ليها !
export const banORUnbannedCompany = errorAsyncHandler(
    async (req, res, next) => {
        const { action } = req.body;
        const { companyId } = req.params;
        const userId = req.user.id; 

        const company = await dbService.findById({
            model: companyModel,
            id: companyId,
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        const isBanning = action === "ban";

        if (isBanning && company.bannedAt) {
            return next(new Error("Company is already banned.", { cause: 400 }));
        }

        if (!isBanning && !company.bannedAt) {
            return next(new Error("Company is already unbanned.", { cause: 400 }));
        }

        const updateData = isBanning
            ? { bannedAt: new Date(), deletedBy: userId }
            : { $unset: { bannedAt: "", deletedBy: "" } };

        await dbService.findByIdAndUpdate({
            model: companyModel,
            id: companyId,
            data: updateData,
            options: { new: true },
        });

        const message = isBanning
            ? "Company banned successfully"
            : "Company unbanned successfully";

        return successResponse({ res, message, status: 200 , 
            data: { 
                company 
            } 
        });
    }
);



export const approveCompany = errorAsyncHandler(
    async (req, res, next) => {

        const company = await dbService.findById({
            model: companyModel,
            id: req.params.companyId
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        if (company.approvedByAdmin) {
            return next(new Error("Company is already approved", { cause: 400 }));
        }

        const updatedCompany = await dbService.findByIdAndUpdate({
            model: companyModel,
            id: req.params.companyId,
            data: { approvedByAdmin: true },
            options: { new: true },
        });

        return successResponse({
            res,
            message: "Company approved successfully",
            status: 200,
            data: {updatedCompany},
        });
    }
);


// deleted
export const getApprovedCompanies = errorAsyncHandler(
    async (req, res, next) => {
        const approvedCompanies = await dbService.findAll({
            model: companyModel,
            filter: {
                approvedByAdmin: true,
                deletedAt: { $exists: false }
            }
        });

        return successResponse({
            res,
            message: "Approved companies fetched successfully",
            status: 200,
            data: approvedCompanies,
        });
    }
);