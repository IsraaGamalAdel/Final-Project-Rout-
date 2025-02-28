import { GraphQLNonNull, GraphQLString } from "graphql";
import * as dbService from "../../../DB/db.service.js";
import * as companyTypes from "../types/company.types.js";
import { companyModel } from './../../../DB/model/Company.model.js';
import { authentication } from './../../../middleware/auth.graphQL.middleware.js';
import { endPoint } from "../admin.endpoint.js";


export const companyList = {
    type: companyTypes.companyListResponse , 

    args: {
        token: { type: new GraphQLNonNull(GraphQLString) },
    },

    resolve: async (parent, args) => {

        const user = await authentication({ authorization: args.token });

        if (!Array.isArray(endPoint.admin) || !endPoint.admin.includes(user.role)) {
            throw new Error("Unauthorized: Access restricted to admins only");
        }
        
        const companies = await dbService.findAll({
            model: companyModel,
            filter: { deletedAt: { $exists: false } }
        });

        return { statusCode: 200, message: "Success", data: companies };
    }
};


