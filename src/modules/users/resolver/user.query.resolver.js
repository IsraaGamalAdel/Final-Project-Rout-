import { GraphQLNonNull, GraphQLString } from "graphql";
import { authentication } from './../../../middleware/auth.graphQL.middleware.js';
import * as userTypes from "../types/user.types.js";



export const usersList = {
    type: userTypes.allUsersResponse,
    
    args: {
        token: { type: new GraphQLNonNull(GraphQLString) },
    },

    resolve: async (parent , args ) => {

        const user = await authentication({authorization: args.token});

        return {
            statusCode: 200,
            message: "Success",
            data: user
        };
    }
};

