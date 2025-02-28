import * as dbService from "../../../DB/db.service.js";
import { chatModel } from "../../../DB/model/Chat.model.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from './../../../utils/response/success.response.js';



export const findOneChat = errorAsyncHandler(
    async (req , res , next) => {
        const {destId} = req.params;

        const chat = await dbService.findOne({
            model: chatModel,
            filter: {
                $or: [
                    {
                        senderId: req.user._id , receiverId: destId
                    }, 
                    {
                        receiverId: destId , senderId: req.user._id
                    }
                ]
            },
            populate:[
                {
                    path: "senderId" 
                },
                {
                    path: "receiverId" 
                },
                {
                    path: "messages" 
                }
            ]
        })

        // if(!chat){
        //     return next(new Error("Chat not found" , {cause: 404}));
        // }

        return successResponse({
            res,
            message: "Chat data retrieved successfully.",
            status: 200,
            data: { chat }
        })
    }
)