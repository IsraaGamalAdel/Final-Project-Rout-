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
        userCV:  { secure_url: String , public_id: String },
        status: {
            type: String,
            enum: Object.values(statusTypes),
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export const applicationModel = mongoose.models.application || model("application", applicationSchema);