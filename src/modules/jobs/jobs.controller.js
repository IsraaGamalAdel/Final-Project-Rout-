import { Router } from 'express';
import { authentication, authorization } from './../../middleware/auth.middleware.js';
import { endPoint } from './jobs.endpoint.js';
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './jobs.validation.js';
import * as jobsService from './service/jobs.service.js';



const router = Router({mergeParams: true , caseSensitive: true , strict: false});


router.post("/" , 
    authentication(),
    authorization(endPoint.create),
    validation(validators.createJobsValidation),
    jobsService.createJobs
);


router.patch("/updateJob/:jobId",
    authentication(), 
    authorization(endPoint.create),
    validation(validators.updateJobValidation),
    jobsService.updateJob
);


router.delete("/deleteJob/:jobId",
    authentication(),
    authorization(endPoint.create),
    validation(validators.deleteJobValidation),
    jobsService.deleteJob
);


router.get('/' , authentication() ,
jobsService.getAllJobsPagination
);


export default router;


// import applicationController from '../application/application.controller.js';


// const router = Router({mergeParams: true , caseSensitive: true , strict: false});

// router.use("/:jobId?/application" , applicationController);