import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';
import * as jobsTypes from '../../DB/model/jobOpportunity.model.js';



export const createJobsValidation = joi.object().keys({
    jobTitle: generalFields.userName.required(),
    jobLocation: generalFields.address
        .valid(...Object.values(jobsTypes.jobOpportunityTypes))
        .required(),
    workingTime: joi.string()
        .valid(...Object.values(jobsTypes.workingTimeTypes))
        .required(),
    seniorityLevel: joi.string()
        .valid(...Object.values(jobsTypes.seniorityLevelTypes))
        .required(),
    jobDescription: generalFields.description
        .required(),
    technicalSkills: joi.array().items(joi.string().required()).min(1).required(),
    softSkills: joi.array().items(joi.string().required()).min(1).required(),
    closed: joi.boolean().default(false),
    companyId: generalFields.id.required(),
}).options({allowUnknown: false}).required();


export const updateJobValidation = joi.object({
    jobTitle: generalFields.userName,
    jobLocation: generalFields.address.valid(...Object.values(jobsTypes.jobOpportunityTypes)),
    workingTime: joi.string().valid(...Object.values(jobsTypes.workingTimeTypes)),
    seniorityLevel: joi.string().valid(...Object.values(jobsTypes.seniorityLevelTypes)),
    jobDescription: generalFields.description,
    technicalSkills: joi.array().items(joi.string()),
    softSkills: joi.array().items(joi.string()),
    closed: joi.boolean(),
    companyId: generalFields.id.required(),
    jobId: generalFields.id.required(),
});


export const deleteJobValidation = joi.object().keys({
    jobId: generalFields.id.required(),
    companyId: generalFields.id.required(),
});