import mongoose, { model, Schema, Types } from "mongoose";


export const statusTypes = {
    pending: "pending",
    accepted: "accepted",
    viewed: "viewed",
    inConsideration: "in consideration",
    rejected: "rejected",
};


const applicationSchema = new Schema(
    {
        jobId: {
            type: Types.ObjectId,
            ref: "JobOpportunity",
            required: true,
        },
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        companyId: {
            type: Types.ObjectId,
            ref: "Company",
            required: true,
        },
        userCV:  { secure_url: String , public_id: String },
        status: {
            type: String,
            enum: Object.values(statusTypes),
            default: "pending",
        },
    },{
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



applicationSchema.virtual("userData", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true,
});


export const applicationModel = mongoose.models.application || model("application", applicationSchema);