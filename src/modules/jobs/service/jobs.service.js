import { companyModel } from "../../../DB/model/Company.model.js";
import { roleTypes } from "../../../middleware/auth.middleware.js";
import * as dbService from "../../../DB/db.service.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { jobOpportunityModel } from "../../../DB/model/jobOpportunity.model.js";
import { pagination } from "../../../utils/security/pagination.security.js";



const populateList = [
    { path: 'addedBy', select: 'userName email' },
    { path: 'companyId', select: 'companyName' },
];


export const createJobs = errorAsyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params;
        const userId = req.user._id;

        const company = await dbService.findById({
            model: companyModel,
            id: companyId
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        const isAuthorized =
            req.user.role === roleTypes.Admin ||
            req.user.role === roleTypes.SuperAdmin ||
            company.HRs.some(hr => hr.toString() === userId.toString());

        if (!isAuthorized) {
            return next(new Error("Unauthorized: Only company owner or HR can add jobs", { cause: 403 }));
        }

        const existingJob = await dbService.findOne({
            model: jobOpportunityModel,
            filter: {
                jobTitle: req.body.jobTitle,
                companyId: companyId,
            },
        });
    
        if (existingJob) {
            return next(new Error("Job to title already exists for this company", { cause: 409 }));
        }

        const newJob = await dbService.create({
            model: jobOpportunityModel,
            data: {
                ...req.body,
                addedBy: userId,
                companyId: companyId,
            },
        });

        return successResponse({
            res,
            message: "Job added successfully",
            status: 201,
            data: { 
                job: newJob
            },
        });
    }
);


export const updateJob = errorAsyncHandler(
    async (req, res, next) => {
        const { jobId , companyId} = req.params;
        const userId = req.user._id;

        const job = await dbService.findById({
            model: jobOpportunityModel,
            id: jobId,

            populate: { 
                path: "companyId" 
            } ,
        });

        // const job = await dbService.findOne({
        //     model: jobOpportunityModel,
        //     filter: {
        //         _id: jobId ,
        //         companyId: companyId,
        //     },
        //     populate: [{
        //         path: "companyId",
        //     }]
        // }) 
    
        if (!job) {
            return next(new Error("Job not found", { cause: 404 }));
        }

        const isOwner = job.companyId.CreatedBy.toString() === userId.toString();
        if (!isOwner) {
            return next(new Error("Unauthorized: Only the company owner can update this job", { cause: 403 }));
        }

        const updatedJob = await dbService.findByIdAndUpdate({
            model: jobOpportunityModel,
            id: jobId,
            data: {
                ...req.body,
                updatedBy: userId,
            },
            options: { new: true },
        });

        // const updatedJob = await dbService.findOneAndUpdate({
        //     model: jobOpportunityModel,
        //     filter: {
        //         _id: jobId ,
        //         companyId: companyId,
        //     },
        //     data:{
        //         ...req.body,
        //         updatedBy: userId
        //     },
        //     options: {
        //         new: true
        //     }
        // })
    
        return successResponse({
            res,
            message: "Job updated successfully",
            status: 200,
            data: {
                job: updatedJob
            },
        });
    }
);


export const deleteJob = errorAsyncHandler(
    async (req, res, next) => {
        const { jobId, companyId } = req.params;
        const userId = req.user._id;

        const job = await dbService.findById({
            model: jobOpportunityModel,
            id: jobId,
            populate: "companyId",
        });

        if (!job || job.companyId._id.toString() !== companyId) {
            return next(new Error("Job not found", { cause: 404 }));
        }

        const isHR = job.companyId.HRs.some(hr => hr.toString() === userId.toString());
        const isOwner = job.companyId.CreatedBy.toString() === userId.toString();

        if (!isHR && !isOwner) {
            return next(new Error("Unauthorized: Only company HR or owner can delete this job", { cause: 403 }));
        }

        await dbService.findByIdAndDelete({
            model: jobOpportunityModel,
            id: jobId,
        });

        return successResponse({
            res,
            message: "Job deleted successfully",
            status: 200,
        });
    }
);


export const getAllJobsPagination = errorAsyncHandler(
    async (req, res, next) => {

        const { page , size, sort= '-createdAt', companyName ,
            workingTime, 
            jobLocation, 
            seniorityLevel, 
            jobTitle, 
            technicalSkills 
        } = req.query;
        const { companyId } = req.params;

        let filter = {};

        if (companyName) {
            const company = await dbService.findOne({
                model: companyModel,
                filter: { companyName: { $regex: companyName, $options: "i" } }
            });
    
            if (!company) {
                return next(new Error("Company not found", { cause: 404 }));
            }
            filter.companyId = company._id;
        }

        if (companyId) {
            filter.companyId = companyId;
        }

        if (workingTime) {
            filter.workingTime = workingTime; 
        }
        if (jobLocation) {
            filter.jobLocation = jobLocation;
        }
        if (seniorityLevel) {
            filter.seniorityLevel = seniorityLevel;
        }
        if (jobTitle) {
            filter.jobTitle = { $regex: jobTitle, $options: 'i' };
        }
        if (technicalSkills) {
            filter.technicalSkills = { $in: technicalSkills.split(',') };
        }

        const data = await pagination({
            model: jobOpportunityModel,
            filter,
            page,
            size: size,
            sort,
            populate: populateList
        })

        return successResponse({ res, 
            message: "Welcome User to your account ( All jobs)" ,  
            status:200 , 
            data
        });

    }
);

export const getAllJobsPaginationFilters = errorAsyncHandler(
    async (req, res, next) => {
        const { 
            page, 
            size, 
            sort = '-createdAt', 
            workingTime, 
            jobLocation, 
            seniorityLevel, 
            jobTitle, 
            technicalSkills 
        } = req.query;

        let filter = {};

        if (workingTime) {
            filter.workingTime = workingTime; 
        }
        if (jobLocation) {
            filter.jobLocation = jobLocation;
        }
        if (seniorityLevel) {
            filter.seniorityLevel = seniorityLevel;
        }
        if (jobTitle) {
            filter.jobTitle = { $regex: jobTitle, $options: 'i' };
        }
        if (technicalSkills) {
            filter.technicalSkills = { $in: technicalSkills.split(',') };
        }

        const data = await pagination({
            model: jobOpportunityModel,
            filter,
            page,
            size,
            sort,
            populate: populateList
        });

        return successResponse({
            res,
            message: "Welcome User to your account ( All jobs to filters)",
            status: 200,
            data
        });
    }
);
