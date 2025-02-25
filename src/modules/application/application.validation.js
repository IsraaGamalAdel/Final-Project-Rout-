import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';
import * as jobsTypes from '../../DB/model/jobOpportunity.model.js';



export const createJobsValidation = joi.object().keys({
    jobId: generalFields.id.required(),
    file: generalFields.files,
}).or('file');


