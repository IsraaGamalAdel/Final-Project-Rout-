import {userModel} from './../DB/model/User.model.js';
import { tokenTypes, verifyToken2 } from '../utils/token/token.js';
import * as dbService from '../DB/db.service.js';



export const authentication = async({authorization , tokenType = tokenTypes.access} = {}) => {
    
    const [bearer , token ] = authorization?.split(" ") || [];
        if(!bearer || !token){
            throw new Error("Not Authorized Access or invalid token" , {cause: 400});
        }
            
        let accessSignature = "";
        let refreshSignature = "";
        switch (bearer) {
            case "System": 
                accessSignature = process.env.SYSTEM_ACCESS_TOKEN
                refreshSignature = process.env.SYSTEM_REFRESH_TOKEN
                break;
            case "Bearer":
                accessSignature = process.env.USER_ACCESS_TOKEN
                refreshSignature = process.env.USER_REFRESH_TOKEN
                break;
            default:
                break;
        }
        const decoded = verifyToken2({ token , signature : tokenType === tokenTypes.access ? accessSignature : refreshSignature });

        if(!decoded?.id){
            throw new Error("invalid token" );
        }
        
        const user = await dbService.findOne({
            model: userModel,
            filter: {_id: decoded.id , deleted: false}
        });
            
        if(!user){
            throw new Error("In_valid account user not found");
        }
    
        const tolerance = 5000; // 5 seconds
        if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000 + tolerance) {
            throw new Error("Expired Token: Credentials have changed");
        }
    
        return user;
};


export const authorization = async ({accessRoles = [] , role} = {}) => {
    if(!accessRoles.includes(role)){
        throw new Error("Not Authorized Access");
    } 
    return true;
};


