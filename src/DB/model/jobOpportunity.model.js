import  mongoose, { model, Schema, Types } from "mongoose";



export const jobOpportunityTypes = {
    cairo: "cairo",
    helwan: "helwan",
    nasrCity: "nasrCity",
    maadi: "maadi",
};

export const workingTimeTypes = {
    fullTime: "full Time",
    partTime: "part Time",
};

export const seniorityLevelTypes = {
    fresh: "fresh",
    junior: "junior",
    middle: "middle",
    senior: "senior",
    teamLead: "teamLead", 
}


const jobOpportunitySchema = new Schema({
    jobTitle: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 2,
        maxlength: 100
    },
    jobLocation: {
        type: String,
        required: true,
        enum: Object.values(jobOpportunityTypes),
    },
    workingTime: {
        type: String,
        required: true,
        enum: Object.values(workingTimeTypes),
    },
    seniorityLevel: {
        type: String,
        required: true,
        enum: Object.values(seniorityLevelTypes),
    },
    jobDescription: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 10000
    },
    technicalSkills: {
        type: [String],
        required: true,
        validate: [
            (arr) => arr.length > 0, "At least one technical skill is required",
        ],
    },
    softSkills: {
        type: [String],
        required: [true, "Soft skills are required"],
        validate: [
            (arr) => arr.length > 0, "At least one soft skill is required",
        ],
    },
    addedBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    closed: {
        type: Boolean,
    },
    companyId: {
        type: Types.ObjectId,
        ref: "Company",
        required: true
    },
} , { 
    timestamps: true ,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


// jobOpportunitySchema.virtual('application', {
//     ref: 'application',
//     localField: '_id',
//     foreignField: 'jobId'
// });



export const jobOpportunityModel = mongoose.models.JobOpportunity || model("JobOpportunity" , jobOpportunitySchema);