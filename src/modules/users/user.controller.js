import  Router from "express";
import * as userService from './service/user.service.js';
import { endPoint } from './user.endpoint.js';
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './user.validation.js';
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { fileValidationTypes } from "../../utils/multer/local.multer.js";
import { uploadCloudinaryFile } from "../../utils/multer/cloudinary.multer.js";



const router = Router();

// get Login User Account Data
router.get('/profile' , 
    authentication() , 
    userService.getLoginUserAccountData
);


// Get Profile Data For Another User
router.get('/profile/:userId' , 
    authentication() , 
    userService.GetProfileDataForAnotherUser
);

// userProfile
router.patch('/update_User_Account' , 
    validation(validators.updateUserValidation), 
    authentication(), authorization(endPoint.profile) ,  
    userService.updateUserAccount
);

// UpdatePassword
router.patch('/profile/password', 
    validation(validators.updatePasswordValidation), 
    authentication(), authorization(endPoint.profile), 
    userService.UpdatePassword
);

// Email
router.patch('/profile/email' ,
    validation(validators.updateEmailValidation) ,
    authentication() , 
    userService.UpdateEmail
);

router.patch('/profile/replace-email' , 
    validation(validators.replaceEmailValidation) ,
    authentication() , userService.replaceEmail
);


// Images
router.patch('/profile/image', 
    authentication() ,  
    uploadCloudinaryFile( fileValidationTypes.image).single('image') , 
    userService.updateImage
);

router.patch('/profile/image/cover',
    authentication() , 
    uploadCloudinaryFile(fileValidationTypes.image).array('images' , 5) , 
    userService.coverImages
);


// Delete Images
router.delete('/profile/delete_image' , 
    validation(validators.deleteImageValidation) , 
    authentication() , 
    userService.deleteImage
);

router.delete('/profile/delete_images/cover' , 
    validation(validators.deleteImageValidation) , 
    authentication() , 
    userService.deleteCoverImages
);


// Soft Delete Account
router.delete('/profile/delete_account' , 
    authentication() , 
    authorization(endPoint.profile), 
    userService.SoftDeleteAccount);

// Restore Account
router.patch('/profile/restore_account' , 
    validation(validators.updateEmailValidation) , 
    authentication() , 
    authorization(endPoint.profile), 
    userService.restoreAccount
);


export default router;