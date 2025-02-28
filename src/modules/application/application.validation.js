import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';
import * as jobsTypes from '../../DB/model/jobOpportunity.model.js';



export const createJobsValidation = joi.object().keys({
    jobId: generalFields.id.required(),
    companyId: generalFields.id.required(),
    file: generalFields.files,
}).or('file');



export const getAllApplicationsValidation = joi.object().keys({
    jobId: generalFields.id.required(),
    companyId: generalFields.id.required(),
    page: joi.number().integer().min(1).default(1),
    size: joi.number().integer().min(1).max(100).default(10),
    sort: joi.string(),

}).required();


export const updateApplicationStatusValidation = joi.object().keys({
    applicationId: generalFields.id.required(),
    status: joi.string()
}).required();


export const getApplicationsByCompanyAndDateValidation = joi.object().keys({
    companyId: generalFields.id.required(),

    // data: joi.date().raw().required(),

}).required();


