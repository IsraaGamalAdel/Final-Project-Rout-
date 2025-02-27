import ExcelJS from 'exceljs';
import * as dbService from "../../../DB/db.service.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { jobOpportunityModel } from "../../../DB/model/jobOpportunity.model.js";
import cloudinary from './../../../utils/multer/cloudinary.js';
import { applicationModel, statusTypes } from "../../../DB/model/application.model.js";
import { pagination } from "../../../utils/security/pagination.security.js";
import { companyModel } from './../../../DB/model/Company.model.js';
import { roleTypes } from "../../../middleware/auth.middleware.js";
import { emailEvent } from "../../../utils/events/sendEmailEvent.js";




// export const createApplication = errorAsyncHandler(
//     async (req, res, next) => {
//         const userId = req.user._id;
//         const { jobId , companyId} = req.params;

//         const jobExists = await dbService.findById({
//             model: jobOpportunityModel,
//             id: jobId
//         });
//         if (!jobExists) {
//             return next(new Error(" job not found", { cause: 404 }));
//         }

//         const existingApplication = await dbService.findOne({
//             model: applicationModel,
//             filter: {
//                 jobId,
//                 userId
//             }
//         });
//         if (existingApplication) {
//             return next(new Error("You have already applied for this job", { cause: 400 }));
//         }

//         if (req.file) {
//             const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
//                 folder: `${process.env.APP_NAME_CV}/${userId}/cv`
//             });
//             req.body.userCV = { secure_url, public_id };
//         }
        
//         const newApplication = await dbService.create({
//             model: applicationModel,
//             data: {
//                 ...req.body,
//                 jobId,
//                 userId
//             }
//         });

//         return successResponse({
//             res,
//             message: "Application created successfully",
//             status: 201,
//             data: {
//                 newApplication
//             }
//         });
//     }
// );


export const createApplication = errorAsyncHandler(
    async (req, res, next) => {
        const userId = req.user._id;
        const { jobId, companyId } = req.params;

        const jobExists = await dbService.findById({
            model: jobOpportunityModel,
            id: jobId
        });
        if (!jobExists) {
            return next(new Error("Job not found", { cause: 404 }));
        }

        const companyExists = await dbService.findById({
            model: companyModel,
            id: companyId
        });
        if (!companyExists) {
            return next(new Error("Company not found", { cause: 404 }));
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
                companyId,
                userId, 
            }
        });

        return successResponse({
            res,
            message: "Application created successfully",
            status: 201,
            data: { newApplication }
        });
    }
);


export const getAllApplications = errorAsyncHandler(
    async (req, res, next) => {
        const { jobId } = req.params;
        const userId = req.user._id;
        const { page, size, sort = "-createdAt" } = req.query;

        const jobExists = await dbService.findById({
            model: jobOpportunityModel,
            id: jobId,
        });

        if (!jobExists) {
            return next(new Error("Job not found", { cause: 404 }));
        }

        const company = await dbService.findById({
            model: companyModel,
            id: jobExists.companyId,
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        const isAuthorized =
        req.user.role === roleTypes.Admin ||
        req.user.role === roleTypes.SuperAdmin ||

        company.HRs.some(hr => hr.toString() === userId.toString());
        if (!isAuthorized) {
            return next(new Error("Unauthorized access", { cause: 403 }));
        }

        const data = await pagination({
            model: applicationModel,
            filter: { jobId },
            page,
            size,
            sort,
            populate: [
                {
                    path: "userData",
                    select: "firstName  lastName  email  phone  role " 
                },
                {
                    path: "jobId",
                    select: "jobTitle"
                },
                {
                    path: "companyId",
                    select: "companyName"
                }
            ]
        });

        data.result.forEach((application) => {
            if (application.userData) {
                application.userData = {
                    userName: `${application.userData.firstName} ${application.userData.lastName}`.trim(),
                    email: application.userData.email,
                    role: application.userData.role,
                    phone: application.userData.getDecryptedMobile(),
                };
            }
        });

        return successResponse({
            res,
            message: "Applications retrieved successfully",
            status: 200,
            data
        });
    }
);


export const updateApplicationStatus = errorAsyncHandler(
    async (req, res, next) => {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        const application = await dbService.findById({
            model: applicationModel,
            id: applicationId,
            populate: [
                { path: "userId", select: "firstName lastName  email" },
                { path: "jobId" }
            ],
        });

        if (!application) {
            return next(new Error("Application not found", { cause: 404 }));
        }

        if (![statusTypes.accepted, statusTypes.rejected].includes(status)) {
            return next(new Error("Invalid status. Use 'accepted' or 'rejected' ", { cause: 400 }));
        }

        application.status = status;
        await application.save();

        const applicationUser = application.userId;
        const job = application.jobId;

        if (status === statusTypes.accepted) {
            emailEvent.emit("sendEmailJobAccepted" , {job , applicationUser});
        } else if (status === statusTypes.rejected) {
            emailEvent.emit("sendEmailJobRejected" , {job , applicationUser});
        }

        return successResponse({
            res,
            message: `Application has been ${status.toLowerCase()} successfully.`,
            status: 200,
            data: {
                application,
                
            },
        });
    }
);


export const downloadApplicationsExcel = errorAsyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params;
        
        const applications = await dbService.findAll({
            model: applicationModel,
            filter: { companyId },
            populate: [{ path: "userId", select: "firstName lastName email" }],
        });
        
        if (!applications.length) {
            return res.status(404).json({ message: "No applications found" });
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Applications");
        
        worksheet.columns = [
            { header: "User Name", key: "userName", width: 30 },
            { header: "Email", key: "email", width: 30 },
            { header: "Status", key: "status", width: 20 },
            { header: "Application Date", key: "applicationDate", width: 25 },
        ];
        
        applications.forEach((application) => {
            worksheet.addRow({
                userName: `${application.userId.firstName} ${application.userId.lastName}`,
                email: application.userId.email,
                status: application.status,
                applicationDate: new Date(application.createdAt).toISOString(),
            });
        });
        
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=applications_${companyId}.xlsx`
        );
        
        await workbook.xlsx.write(res);
        res.end();
    }
);


