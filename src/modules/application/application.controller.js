import { Router } from 'express';
import * as applicationService from './service/application.service.js';
import { endPoint } from './application.endpoint.js';
import { validation } from './../../middleware/validation.middleware.js';
import * as validators from './application.validation.js';
import { authentication, authorization } from './../../middleware/auth.middleware.js';
import { uploadCloudinaryFile } from './../../utils/multer/cloudinary.multer.js';
import { fileValidationTypes } from './../../utils/multer/local.multer.js';



const router = Router({mergeParams: true , caseSensitive: true , strict: false});


router.post("/addApplicationCV/:jobId" , 
    authentication(),
    authorization(endPoint.create),
    uploadCloudinaryFile(fileValidationTypes.document).single('userCV'),
    validation(validators.createJobsValidation),
    applicationService.createApplication
);





export default router;
