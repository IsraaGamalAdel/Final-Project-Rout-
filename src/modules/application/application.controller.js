import { Router } from 'express';
import * as applicationService from './service/application.service.js';
import { endPoint } from './application.endpoint.js';
import { validation } from './../../middleware/validation.middleware.js';
import * as validators from './application.validation.js';
import { authentication, authorization } from './../../middleware/auth.middleware.js';
import { uploadCloudinaryFile } from './../../utils/multer/cloudinary.multer.js';
import { fileValidationTypes } from './../../utils/multer/local.multer.js';



const router = Router({mergeParams: true , caseSensitive: true , strict: false});


// router.post("/addApplicationCV" , 
//     authentication(),
//     authorization(endPoint.create),
//     uploadCloudinaryFile(fileValidationTypes.document).single('userCV'),
//     validation(validators.createJobsValidation),
//     applicationService.createApplication
// );


// router.get('/getApplication' ,
//     authentication(),
//     authorization(endPoint.roleApplications),
//     validation(validators.getAllApplicationsValidation),
//     applicationService.getAllApplications
// );


router.get('/getApplications' ,
    authentication(),
    applicationService.getSingleApplication
);


router.post("/addApplicationCV/:companyId/jobs/:jobId" , 
    authentication(),
    authorization(endPoint.create),
    uploadCloudinaryFile(fileValidationTypes.document).single('userCV'),
    validation(validators.createJobsValidation),
    applicationService.createApplication
);


router.get('/getApplication/:companyId/jobs/:jobId' ,
    authentication(),
    authorization(endPoint.roleApplications),
    validation(validators.getAllApplicationsValidation),
    applicationService.getAllApplications
);


router.patch("/:applicationId/status", 
    authentication(),
    authorization(endPoint.create),
    validation(validators.updateApplicationStatusValidation),
    applicationService.updateApplicationStatus
);


router.get('/downloadApplicationsExcel/:companyId' ,
    authentication(),
    validation(validators.getApplicationsByCompanyAndDateValidation),
    authorization(endPoint.roleApplications),
    applicationService.downloadApplicationsExcel
);



export default router;



// router.get('/company' ,
//     authentication(),
//     authorization(endPoint.roleApplications),
//     validation(validators.getApplicationsByCompanyAndDateValidation),
//     applicationService.getApplicationsByCompany
// );
