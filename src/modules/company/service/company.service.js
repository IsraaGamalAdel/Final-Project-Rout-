import * as dbService from '../../../DB/db.service.js';
import { errorAsyncHandler } from './../../../utils/response/error.response.js';
import { companyModel } from './../../../DB/model/Company.model.js';
import { successResponse } from './../../../utils/response/success.response.js';
import cloudinary from './../../../utils/multer/cloudinary.js';
import { roleTypes } from '../../../middleware/auth.middleware.js';



export const addCompany = errorAsyncHandler(
    async (req, res, next) => {
        const { companyName, companyEmail } = req.body;

        const existCompany = await dbService.findOne({
            model: companyModel,
            filter: { $or: [{ companyName }, { companyEmail }] },
        });

        if (existCompany) {
            return next(new Error("Company name or email already exists", { cause: 409 }));
        }

        const updateData = { ...req.body };

        if (req.files) {
            try {
                if (req.files.logo) {
                    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.logo[0].path, {
                        folder: `Companies/${req.user._id}/logo`,
                    });
                    updateData.logo = { secure_url, public_id };
                }

                if (req.files.coverPic) {
                    const coverPics = [];
                    for (const file of req.files.coverPic) {
                        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                            folder: `Companies/${req.user._id}/coverPic`,
                        });
                        coverPics.push({ secure_url, public_id });
                    }
                    updateData.coverPic = coverPics;
                }
            } catch (error) {
                return next(new Error("Image upload failed. Update aborted", { cause: 500 }));
            }
        }


        const newCompany = await dbService.create({
            model: companyModel,
            data: {
                ...req.body,
                CreatedBy: req.user._id,
                ...updateData
            },
        });

        return successResponse({ res, message: "Company added successfully", status: 201,
            data: {
                company: newCompany
            },
        });
    }
);


// export const updateCompany = errorAsyncHandler(
//     async (req, res, next) => {
//         const { companyId } = req.params;

//         const existCompany = await dbService.findOne({
//             model: companyModel,
//             filter: {
//                 _id: companyId,
//                 deleted: { $exists: false },
//                 CreatedBy: req.user._id, 
//             },
//         });

//         if (!existCompany) {
//             return next(new Error("Company not found or not authorized", { cause: 404 }));
//         }

//         if (req.body.legalAttachment) {
//             return next(new Error("Updating legalAttachment is not allowed", { cause: 403 }));
//         }

//         const updateData = { ...req.body };

//         if (req.files) {
//             try {
//                 if (req.files.logo) {
//                     const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.logo[0].path, {
//                         folder: `Companies/${req.user._id}/logo`,
//                     });
//                     updateData.logo = { secure_url, public_id };
//                 }

//                 if (req.files.coverPic) {
//                     const coverPics = [];
//                     for (const file of req.files.coverPic) {
//                         const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
//                             folder: `Companies/${req.user._id}/coverPic`,
//                         });
//                         coverPics.push({ secure_url, public_id });
//                     }
//                     updateData.coverPic = coverPics;
//                 }
//             } catch (error) {
//                 return next(new Error("Image upload failed. Update aborted.", { cause: 500 }));
//             }
//         }

//         const updatedCompany = await dbService.findOneAndUpdate({
//             model: companyModel,
//             filter: { _id: companyId },
//             data: updateData,
//             options: { new: true, runValidators: true },
//         });

//         if (!updatedCompany) {
//             return next(new Error("Company update failed", { cause: 500 }));
//         }

//         return successResponse({
//             res,
//             message: "Company updated successfully",
//             status: 200,
//             data: {
//                 company: updatedCompany,
//             },
//         });
//     }
// );


export const updateCompany = errorAsyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params;

        const existCompany = await dbService.findOne({
            model: companyModel,
            filter: {
                _id: companyId,
                deleted: { $exists: false },
                CreatedBy: req.user._id,
            },
        });

        if (!existCompany) {
            return next(new Error("Company not found or not authorized", { cause: 404 }));
        }


        if (req.body.legalAttachment) {
            return next(new Error("Updating legalAttachment is not allowed", { cause: 403 }));
        }

        // if (req.files?.logo || req.files?.coverPic) {
        //     return next(new Error("Updating images is not allowed", { cause: 403 }));
        // }

        const updateData = { ...req.body };

        const updatedCompany = await dbService.findOneAndUpdate({
            model: companyModel,
            filter: { _id: companyId },
            data: updateData,
            options: { new: true, runValidators: true },
        });

        if (!updatedCompany) {
            return next(new Error("Company update failed", { cause: 500 }));
        }

        return successResponse({
            res,
            message: "Company updated successfully",
            status: 200,
            data: {
                company: updatedCompany,
            },
        });
    }
);


export const SoftDeleteCompanyName = errorAsyncHandler(
    async (req, res, next) => {
        const owner = req.user.role === roleTypes.Admin ? {} : { CreatedBy: req.user._id };

        const company = await dbService.findOneAndUpdate({
            model: companyModel,
            filter: {
                companyName: req.body.companyName,
                deleted: { $exists: false },
                ...owner
            },
            data: {
                deletedAt: Date.now(),
                deletedBy: req.user._id
            },
            options: { new: true }
        });

        if (!company) {
            return next(new Error("Company not found or not authorized", { cause: 404 }));
        }

        return successResponse({
            res,
            message: "Company soft deleted successfully",
            status: 200,
            data: { company }
        });
    }
);


export const SoftDeleteCompany = errorAsyncHandler(
    async (req, res, next) => {

        const owner = req.user.role === roleTypes.Admin ? {} : { CreatedBy: req.user._id };

        const company = await dbService.findOneAndUpdate({
            model: companyModel,
            filter: {
                _id: req.params.companyId,
                deletedAt: { $exists: false },
                ...owner
            },
            data: {
                deletedAt: Date.now(),
                deletedBy: req.user._id
            },
            options: {
                new: true
            }
        });

        if (!company) {
            return next(new Error("Company not found or not authorized", { cause: 404 }));
        }

        return successResponse({ res, message: "Company soft deleted successfully", status: 200,
            data: {
                company
            }
        });
    }
);


export const restoreCompany = errorAsyncHandler(
    async (req, res, next) => {

        const company = await dbService.findOneAndUpdate({
            model: companyModel,
            filter: {
                _id: req.params.companyId,
                deletedAt: { $exists: true },
                deletedBy: req.user._id
            },
            data: {
                $unset: {
                    deletedAt: 1,
                    deletedBy: 1
                }
            },
            options: {
                new: true
            }
        });

        if (!company) { 
            return next(new Error("Company not found or not authorized", { cause: 404 }));
        }

        return successResponse({
            res,
            message: "Company restored successfully",
            status: 200,
            data: {
                company
            },
        })
    }
);



export const getCompanyWithJobs = errorAsyncHandler(
    async (req, res, next) => {

        const company = await dbService.findOne({
            model: companyModel,
            filter: {
                _id: req.params.companyId,
                deletedAt: { $exists: false },
            },
            options: {
                populate: {
                    path: "jobs",
                    select: "title description",
                },
            },
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        return successResponse({
            res,
            message: "Company with related jobs retrieved successfully",
            status: 200,
            data: {
                company
            }
        });

    }
);


export const searchCompanyWithName = errorAsyncHandler(
    async (req, res, next) => {

        const {companyName} = req.query;

        const searchNameCompany = await dbService.findAll({
            model: companyModel,
            filter: {
                companyName: { $regex: companyName , $options: "i" },
                deletedAt: { $exists: false },
            },
        });

        if (!searchNameCompany) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        return successResponse({
            res,
            message: "Company with related jobs retrieved successfully",
            status: 200,
            data: {
                searchNameCompany
            },
        })
    }
);


export const deleteCompanyLogo = errorAsyncHandler(
    async (req, res, next) => {
        
        const owner = req.user.role === roleTypes.Admin ? {} : { CreatedBy: req.user._id };

        const company = await dbService.findOne({
            model: companyModel,
            filter: {
                _id: req.params.companyId,
                deletedAt: { $exists: false },
                ...owner
            },
        });

        if (!company) {
            return next(new Error("Company not found or not authorized", { cause: 404 }));
        }

        if(company.logo && company.logo.public_id){
            await cloudinary.uploader.destroy(company.logo.public_id);
        }else{
            return next(new Error("Image already deleted successfully", { cause: 200 }));
        }

        const updatedCompany = await dbService.findOneAndUpdate({
            model: companyModel,
            filter: {_id: req.params.companyId},
            data: {
                $unset: {
                    logo: 1
                }
            },
            options: {
                new: true
            }
        });

        return successResponse({ res, message: "Company logo deleted successfully", status: 200,
            data: {
                company: updatedCompany
            },
        })
    }
);


export const deleteCompanyCoverPic = errorAsyncHandler(
    async (req, res, next) => {
        const owner = req.user.role === roleTypes.Admin ? {} : { CreatedBy: req.user._id };
        const { public_id } = req.body;

        const company = await dbService.findOne({
            model: companyModel,
            filter: {
                _id: req.params.companyId,
                deletedAt: { $exists: false },
                ...owner
            },
        });

        if (!company) {
            return next(new Error("Company not found or not authorized", { cause: 404 }));
        }

        if (!company.coverPic || company.coverPic.length === 0) {
            return next(new Error("Cover pictures are already deleted", { cause: 400 }));
        }

        if (public_id) {
            const imageToDelete = company.coverPic.find((pic) => pic.public_id === public_id);

            if (!imageToDelete) {
                return next(new Error("Image not found in cover pictures", { cause: 404 }));
            }
            await cloudinary.uploader.destroy(public_id);

            company.coverPic = company.coverPic.filter((pic) => pic.public_id !== public_id);

            await company.save();

            return successResponse({
                res,
                message: "img cover picture deleted successfully",
                status: 200,
                data: { company },
            });
        }

        for (const image of company.coverPic) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        company.coverPic = [];
        await company.save();

        return successResponse({
            res,
            message: "All cover pictures deleted successfully",
            status: 200,
            data: { company },
        });
    }
);
