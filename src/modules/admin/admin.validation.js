import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';


export const blockUserValidation = joi.object().keys({
    email: generalFields.email.required(),
}).required();



export const banOrUnbanCompanyValidation = joi.object().keys({
    companyId: generalFields.id.required(),
    action: joi.string().valid('ban' , 'unban').default('ban').required(),
}).required();


export const approvedAdminCompanyValidation = joi.object().keys({
    companyId: generalFields.id.required(),
}).required();






