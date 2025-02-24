import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';


export const blockUserValidation = joi.object().keys({
    email: generalFields.email.required(),
}).required();







