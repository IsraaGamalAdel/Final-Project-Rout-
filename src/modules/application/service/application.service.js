import * as dbService from "../../../DB/db.service.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { jobOpportunityModel } from "../../../DB/model/jobOpportunity.model.js";
import cloudinary from './../../../utils/multer/cloudinary.js';
import { applicationModel } from "../../../DB/model/application.model.js";


export const createApplication = errorAsyncHandler(
    async (req, res, next) => {
        const userId = req.user._id;
        const { jobId } = req.params;

        const jobExists = await dbService.findById({
            model: jobOpportunityModel,
            id: jobId
        });
        if (!jobExists) {
            return next(new Error(" job not found", { cause: 404 }));
        }

        const existingApplication = await dbService.findOne({
            model: applicationModel,
            filter: {
                jobId,
                userId
            }
        });
        if (existingApplication) {
            return next(new Error("You have already applied for this job", { cause: 400 }));
        }

        if (req.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: `${process.env.APP_NAME_CV}/${userId}/cv`
            });
            req.body.userCV = { secure_url, public_id };
        }
        
        const newApplication = await dbService.create({
            model: applicationModel,
            data: {
                ...req.body,
                jobId,
                userId
            }
        });

        return successResponse({
            res,
            message: "Application created successfully",
            status: 201,
            data: {
                newApplication
            }
        });
    }
);


