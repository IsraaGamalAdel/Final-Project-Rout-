import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';




//Create Company
export const createCompanyValidation = joi.object().keys({
    companyName: generalFields.userName.required(),
    companyEmail: generalFields.email.required(),
    description: joi.string().min(2).max(1000).trim(),
    address: generalFields.address.required(),
    industry: joi.string().required(),
    numberOfEmployees: joi.string().required(),
    file: joi.array().items(generalFields.files).max(2),
}).or('companyName' , 'companyEmail' , 'file');


//Update Company
export const updateCompanyValidation = joi.object({
    companyId: generalFields.id.required(),
    companyName: generalFields.userName,
    companyEmail: generalFields.email,
    description: joi.string().min(2).max(1000).trim(),
    address: generalFields.address,
    industry: joi.string(),
    numberOfEmployees: joi.string().valid("1-15", "16-20", "21-50"),
}).or('companyName', 'companyEmail', 'description', 'address', 'industry', 'numberOfEmployees');


export const deleteCompanyCoverPicValidation = joi.object().keys({
    companyId: generalFields.id.required(),
    public_id: joi.string(),
}).required();



export const SoftDeleteCompanyValidation = joi.object().keys({
    companyId: generalFields.id.required(),
}).required();



export const SoftDeleteCompanyNameValidation = joi.object().keys({
    companyId: generalFields.id.required(),
    companyName: generalFields.userName.required(),
}).required();



export const searchCompanyWithNameValidation = joi.object().keys({
    companyName: joi.string().min(1).max(50).trim().required(),
}).required();


