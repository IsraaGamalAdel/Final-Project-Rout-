import { roleTypes } from "../../middleware/auth.middleware.js";





export const endPoint = { 
    profile: Object.values(roleTypes),

    admin: [roleTypes.Admin , roleTypes.SuperAdmin , roleTypes.HR] ,

    freezeCompany: [roleTypes.User , roleTypes.Admin]

    // profile: [roleTypes.User , roleTypes.Admin]
};

