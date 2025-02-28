import { roleTypes } from "../../middleware/auth.middleware.js";





export const endPoint = { 
    create: [roleTypes.Admin , roleTypes.SuperAdmin , roleTypes.HR] ,
    freeze: [roleTypes.User , roleTypes.Admin]
};

