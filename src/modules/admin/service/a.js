// export const bannedUser = errorAsyncHandler(async (req, res, next) => {
//     const { email } = req.body;

//     if (!email) {
//         return next(new Error("Email is required", { cause: 400 }));
//     }

//     const userToBlock = await dbService.findOne({ model: userModel, filter: { email } });
//     if (!userToBlock) {
//         return next(new Error("User not found", { cause: 404 }));
//     }

//     // Prevent users from blocking themselves
//     if (req.user._id.toString() === userToBlock._id.toString()) {
//         return next(new Error("You cannot block yourself", { cause: 400 }));
//     }

//     const isBlocked = req.user.blockedUsers?.includes(userToBlock._id);

//     // Toggle ban status
//     if (userToBlock.bannedAt) {
//         userToBlock.bannedAt = null;
//         await userToBlock.save();

//         await dbService.findByIdAndUpdate({
//             model: userModel,
//             id: req.user._id,
//             data: { $pull: { blockedUsers: userToBlock._id } },
//             options: { new: true },
//         });

//         return successResponse({ res, message: "User unbanned successfully", status: 200 });
//     } else {
//         userToBlock.bannedAt = new Date();
//         await userToBlock.save();

//         if (!isBlocked) {
//             await dbService.findByIdAndUpdate({
//                 model: userModel,
//                 id: req.user._id,
//                 data: { $addToSet: { blockedUsers: userToBlock._id } },
//                 options: { new: true },
//             });
//         }

//         return successResponse({ res, message: "User banned successfully", status: 200 });
//     }
// });


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
