import { chatModel } from "../../../DB/model/Chat.model.js";
import { authenticationSocket } from "../../../middleware/auth.socket.middleware.js";
import * as dbService from "../../../DB/db.service.js";
import { socketConnection, userModel } from "../../../DB/model/User.model.js";
import { roleTypes } from "../../../middleware/auth.middleware.js";
import { companyModel } from './../../../DB/model/Company.model.js';
import { applicationModel } from "../../../DB/model/Application.model.js";




// export const sendMessage = (socket) => {

//     return socket.on("sendMessage" , async (messageData) => {
//         const {date} = await authenticationSocket({ socket });

//         if(!date.valid){
//             return  socket.emit("socketErrorResponse", date);
//         }
        
//         const userId = date.user._id.toString();

//         const {destId , message} = messageData;

//         const chat = await dbService.findOneAndUpdate({
//             model: chatModel,
//             filter: {
//                 $or: [
//                     {
//                         senderId: userId , receiverId: destId
//                     }, 
//                     {
//                         receiverId: userId , senderId: destId
//                     }
//                 ]
//             },
//             data: {
//                 $push: {
//                     messages: {
//                         message,
//                         senderId: userId
//                     }
//                 }
//             },
//             options: {
//                 new: true
//             }
//         })

//         if(!chat){
//             const chat = await dbService.create({
//                 model: chatModel,
//                 date: {
//                     senderId: userId,
//                     receiverId: destId,
//                     messages: [
//                         {
//                             message,
//                             senderId: userId
//                         }
//                     ]
//                 }
//             })
//         }

//         socket.emit("successMessage" , {message });
//         console.log(socketConnection);
        
//         socket.to(socketConnection.get(destId)).emit("receiveMessage" , {message });
//         return "Done"
//     })
// };



// export const sendMessage = (socket) => {
//     return socket.on("sendMessage", async (messageData) => {
//         const { data } = await authenticationSocket({ socket });

//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const userId = data.user._id.toString();
//         const { destId, message } = messageData;

//         const sender = await dbService.findById({ 
//             model: userModel, 
//             id: userId 
//         });
//         // if (!sender.role.includes(roleTypes.HR) && !sender.role.includes(roleTypes.Admin)) {
//         //     return socket.emit("socketErrorResponse", { message: "Only HR or Company Owner can start a conversation" });
//         // }

//         if (!sender.role.includes(roleTypes.HR) && !sender.role.includes(roleTypes.Admin) && userId !== destId) {
//             return socket.emit("socketErrorResponse", { message: "Only HR or Admin can start a conversation" });
//         }

//         const company = await dbService.findOne({
//             model: companyModel,
//             filter: {
//                 $or: [
//                     { HRs: userId },
//                     { CreatedBy: userId }
//                 ]
//             }
//         })
//         const ownerId = [company?.CreatedBy, ...company?.HRs];


//         const chat = await dbService.findOneAndUpdate({
//             model: chatModel,
//             filter: {
//                 $or: [
//                     { senderId: userId, receiverId: destId },
//                     { receiverId: userId, senderId: destId }
//                 ],
//                 $or: [
//                     { senderId: { $in: ownerId } },
//                     { receiverId: { $in: ownerId } }
//                 ]
//             },
//             data: {
//                 $push: {
//                     messages: {
//                         message,
//                         senderId: userId
//                     }
//                 }
//             },
//             options: {
//                 new: true
//             }
//         });

//         if (!chat) {
//             const chat = await dbService.create({
//                 model: chatModel,
//                 data: {
//                     senderId: userId,
//                     receiverId: destId,
//                     messages: [
//                         {
//                             message,
//                             senderId: userId
//                         }
//                     ]
//                 }
//             });
//         }

//         socket.emit("successMessage", { message });
//         socket.to(socketConnection.get(destId)).emit("receiveMessage", { message });
//         return "Done";
//     });
// };




// export const sendMessage = (socket) => {
//     return socket.on("sendMessage", async (messageData) => {
//         const { data } = await authenticationSocket({ socket });

//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const userId = data.user._id.toString();
//         const { destId, message } = messageData;

//         const sender = await dbService.findById({
//             model: userModel,
//             id: userId,
//         });

//         const company = await dbService.findOne({
//             model: companyModel,
//             filter: {
//                 $or: [{ HRs: userId }, { CreatedBy: userId }],
//             },
//         });

//         const ownerId = [company?.CreatedBy, ...company?.HRs];

//         // ✅ السماح لمقدم الطلب بالرد فقط
//         const isApplicant = await dbService.exists({
//             model: applicationModel,
//             filter: {
//                 userId: userId,
//                 companyId: company?._id,
//             },
//         });

//         const canInitiateChat =
//             sender.role.includes(roleTypes.HR) ||
//             sender.role.includes(roleTypes.Admin) ||
//             ownerId.includes(userId);

//         if (!canInitiateChat && !isApplicant) {
//             return socket.emit("socketErrorResponse", {
//                 message: "Only HR, Admin, or applicants can send messages.",
//             });
//         }

//         const chat = await dbService.findOneAndUpdate({
//             model: chatModel,
//             filter: {
//                 $or: [
//                     { senderId: userId, receiverId: destId },
//                     { receiverId: userId, senderId: destId },
//                 ],
//             },
//             data: {
//                 $push: {
//                     messages: {
//                         message,
//                         senderId: userId,
//                     },
//                 },
//             },
//             options: { new: true },
//         });

//         if (!chat) {
//             await dbService.create({
//                 model: chatModel,
//                 data: {
//                     senderId: userId,
//                     receiverId: destId,
//                     messages: [{ message, senderId: userId }],
//                 },
//             });
//         }

//         socket.emit("successMessage", { message });
//         socket.to(socketConnection.get(destId)).emit("receiveMessage", { message });
//     });
// };




// export const sendMessage = (socket) => {
//     return socket.on("sendMessage", async (messageData) => {
//         const { data } = await authenticationSocket({ socket });

//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const userId = data.user._id.toString();
//         const { destId, message } = messageData;

//         const sender = await dbService.findById({
//             model: userModel,
//             id: userId,
//         });

//         let chat = await dbService.findOne({
//             model: chatModel,
//             filter: {
//                 $or: [
//                     { senderId: userId, receiverId: destId },
//                     { receiverId: userId, senderId: destId },
//                 ],
//             },
//         });

//         const canInitiateChat = sender.role.includes(roleTypes.HR) || sender.role.includes(roleTypes.Admin);

//         if (!chat && !canInitiateChat) {
//             return socket.emit("socketErrorResponse", {
//                 message: "Only HR or Admin can start a conversation.",
//             });
//         }

//         if (!chat) {
//             chat = await dbService.create({
//                 model: chatModel,
//                 data: {
//                     senderId: userId,
//                     receiverId: destId,
//                     messages: [{ message, senderId: userId }],
//                 },
//             });
//         } else {

//             chat = await dbService.findOneAndUpdate({
//                 model: chatModel,
//                 filter: { _id: chat._id },
//                 data: {
//                     $push: {
//                         messages: { message, senderId: userId },
//                     },
//                 },
//                 options: { new: true },
//             });
//         }

//         socket.emit("successMessage", { message });
//         socket.to(socketConnection.get(destId)).emit("receiveMessage", { message });

//     });
// };


// export const sendMessage = (socket) => {
//     return socket.on("sendMessage", async (messageData) => {
//         const { data } = await authenticationSocket({ socket });

//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const userId = data.user._id.toString();
//         const { destId, message } = messageData;

//         const sender = await dbService.findById({ 
//             model: userModel, 
//             id: userId 
//         });

//         if (!sender.role.includes(roleTypes.HR) && !sender.role.includes(roleTypes.Admin)) {
//             return socket.emit("socketErrorResponse", { message: "Only HR or Admin can start a conversation" });
//         }

//         const application = await dbService.findOne({
//             model: applicationModel ,
//             filter: {
//                 userId: destId,
//                 companyId: sender.companyId
//             }
//         });

//         if (!application) {
//             return socket.emit("socketErrorResponse", { message: "User has not applied to any job in this company" });
//         }

//         const company = await dbService.findOne({
//             model: companyModel,
//             filter: {
//                 $or: [
//                     { HRs: userId },
//                     { CreatedBy: userId }
//                 ]
//             }
//         });

//         const ownerId = [company?.CreatedBy, ...company?.HRs];

//         const chat = await dbService.findOneAndUpdate({
//             model: chatModel,
//             filter: {
//                 $or: [
//                     { senderId: userId, receiverId: destId },
//                     { receiverId: userId, senderId: destId }
//                 ],
//                 $or: [
//                     { senderId: { $in: ownerId } },
//                     { receiverId: { $in: ownerId } }
//                 ]
//             },
//             data: {
//                 $push: {
//                     messages: {
//                         message,
//                         senderId: userId
//                     }
//                 }
//             },
//             options: {
//                 new: true
//             }
//         });

//         if (!chat) {
//             const chat = await dbService.create({
//                 model: chatModel,
//                 data: {
//                     senderId: userId,
//                     receiverId: destId,
//                     messages: [
//                         {
//                             message,
//                             senderId: userId
//                         }
//                     ]
//                 }
//             });
//         }

//         socket.emit("successMessage", { message });
//         socket.to(socketConnection.get(destId)).emit("receiveMessage", { message });
//         return "Done";
//     });
// };




export const sendMessage = (socket) => {
    return socket.on("sendMessage", async (messageData) => {
        const { data } = await authenticationSocket({ socket });
        if (!data.valid) {
            return socket.emit("socketErrorResponse", data);
        }

        const userId = data.user._id.toString();
        const { destId, message } = messageData;

        const sender = await dbService.findById({
            model: userModel,
            id: userId
        });

        // Only HR/Admin can start a new conversation
        const chatExists = await dbService.findOne({
            model: chatModel,
            filter: {
                $or: [
                    { senderId: userId, receiverId: destId },
                    { receiverId: userId, senderId: destId }
                ],
                $or: [
                    { senderId: { $in: ownerId } },
                    { receiverId: { $in: ownerId } }
                ]
            },
            data: {
                $push: {
                    messages: {
                        message,
                        senderId: userId
                    }
                }
            },
            options: {
                new: true
            }
        });

        if (!chat) {
            const chat = await dbService.create({
                model: chatModel,
                data: {
                    senderId: userId,
                    receiverId: destId,
                    messages: [
                        {
                            message,
                            senderId: userId
                        }
                    ]
                }
            });
        }

        socket.emit("successMessage", { message });
        socket.to(socketConnection.get(destId)).emit("receiveMessage", { message });
        return "Done";
    });
};



// (نصفها شغال كويس وابقى ارجعلها )
// export const sendMessage = (socket) => {
//     return socket.on("sendMessage", async (messageData) => {
//         const { data } = await authenticationSocket({ socket });
//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const userId = data.user._id.toString();
//         const { destId, message } = messageData;

//         const sender = await dbService.findById({
//             model: userModel,
//             id: userId
//         });

//         // Only HR/Admin can start a new conversation
//         const chatExists = await dbService.findOne({
//             model: chatModel,
//             filter: {
//                 $or: [
//                     { senderId: userId, receiverId: destId },
//                     { senderId: destId, receiverId: userId }
//                 ]
//             }
//         });

//         if (!chatExists && !sender.role.includes(roleTypes.HR) && !sender.role.includes(roleTypes.Admin)) {
//             return socket.emit("socketErrorResponse", {
//                 message: "Only HR or Admin can start a conversation"
//             });
//         }

//         // Update or create a chat
//         const chat = chatExists
//             ? await dbService.findOneAndUpdate({
//                   model: chatModel,
//                   filter: { _id: chatExists._id },
//                   data: {
//                       $push: { messages: { message, senderId: userId } }
//                   },
//                   options: { new: true }
//               })
//             : await dbService.create({
//                   model: chatModel,
//                   data: {
//                       senderId: userId,
//                       receiverId: destId,
//                       messages: [{ message, senderId: userId }]
//                   }
//               });

//         socket.emit("successMessage", { message });
//         socket.to(socketConnection.get(destId)).emit("receiveMessage", { message });
//         return "Done";
//     });
// };