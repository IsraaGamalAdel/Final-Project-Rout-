import { GraphQLNonNull, GraphQLString } from "graphql";
import { authentication } from './../../../middleware/auth.graphQL.middleware.js';
import * as userTypes from "../types/user.types.js";
import { endPoint } from './../user.endpoint.js';



export const usersList = {
    type: userTypes.allUsersResponse,
    
    args: {
        token: { type: new GraphQLNonNull(GraphQLString) },
    },

    resolve: async (parent , args ) => {

        const user = await authentication({authorization: args.token});

        if (!Array.isArray(endPoint.admin) || !endPoint.admin.includes(user.role)) {
            throw new Error("Unauthorized: Access restricted to admins only");
        }

        return {
            statusCode: 200,
            message: "Success",
            data: user
        };
    }
};

