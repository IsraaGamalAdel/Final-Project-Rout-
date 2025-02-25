import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { imageType, userTypes } from "../../users/types/user.types.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/User.model.js";




export const companyType = new GraphQLObjectType({
    name: "companyType",
    fields: {
        _id: { type: GraphQLID },
        companyName: { type: GraphQLString },
        description: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: GraphQLString },
        numberOfEmployees: { type: GraphQLString },
        companyEmail: { type: GraphQLString },
        createdBy: { type: GraphQLID },
        createdByInfo: {
            type: userTypes,
            resolve: async (parent) => {
                return await dbService.findOne({
                    model: userModel,
                    filter: { _id: parent.createdBy, deleted: false }
                });
            }
        },
        logo: { type: imageType },
        coverPic: { type: new GraphQLList(imageType) },
        HRs: { type: new GraphQLList(GraphQLID) },
        bannedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
        deletedBy: { type: GraphQLID },
        legalAttachment: { type: imageType },
        approvedByAdmin: { type: GraphQLBoolean },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString }
    }
})

export const companyList = new GraphQLList( companyType )


export const  companyListResponse = new GraphQLObjectType({
    name: "companyList",
    fields:{
        statusCode: {type: GraphQLInt},
        message: {type: GraphQLString},
        data: {type: companyList}
    }
})
