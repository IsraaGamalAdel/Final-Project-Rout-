import  Router from "express";
import * as userService from './service/company.service.js';
import { authentication, authorization } from './../../middleware/auth.middleware.js';
import { uploadCloudinaryFile } from './../../utils/multer/cloudinary.multer.js';
import { fileValidationTypes } from './../../utils/multer/local.multer.js';
import { validation } from '../../middleware/validation.middleware.js';
import * as validators from './company.validation.js';
import { endPoint } from "./company.endpoint.js";



const router = Router();

router.post('/addCompany' , authentication() , authorization(endPoint.admin) , 
    uploadCloudinaryFile(fileValidationTypes.image).fields([
        { name: 'logo', maxCount: 1 },
        { name: 'coverPic', maxCount: 3 }
    ]),
    validation(validators.createCompanyValidation) ,
    userService.addCompany
);

router.patch( '/updateCompany/:companyId', authentication(), authorization(endPoint.admin),
    uploadCloudinaryFile(fileValidationTypes.image).fields([
        { name: 'logo', maxCount: 1 },
        { name: 'coverPic', maxCount: 3 }
    ]),
    validation(validators.updateCompanyValidation),
    userService.updateCompany
);

router.delete('/Soft_Delete/:companyId' , authentication() , authorization(endPoint.freezeCompany) , 
    validation(validators.SoftDeleteCompanyValidation) ,
    userService.SoftDeleteCompany
);


router.patch('/restoreCompany/:companyId' , authentication() , authorization(endPoint.freezeCompany) , 
    validation(validators.SoftDeleteCompanyValidation) ,
    userService.restoreCompany
);

router.get('/:companyId/jobs' , 
    authentication() ,  authorization(endPoint.profile) , 
    validation(validators.SoftDeleteCompanyValidation),
    userService.getCompanyWithJobs
);


router.get('/searchCompanyWithName' ,
    authentication() , 
    validation(validators.searchCompanyWithNameValidation) , 
    userService.searchCompanyWithName
);


router.delete('/deleteCompanyLogo/:companyId' , authentication() , authorization(endPoint.admin) , 
    validation(validators.SoftDeleteCompanyValidation) ,
    userService.deleteCompanyLogo
);

router.delete('/deleteCompanyCoverPic/:companyId' , authentication() , authorization(endPoint.admin) , 
    validation(validators.deleteCompanyCoverPicValidation) ,
    userService.deleteCompanyCoverPic
);

export default router;
