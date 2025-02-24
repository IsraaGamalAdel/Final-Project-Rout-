import  mongoose, { model, Schema, Types } from "mongoose";



const companySchema = new Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 2,
        maxlength: 100
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 10000
    },
    industry: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    numberOfEmployees: {
        type: String,
        enum: [
        "1-15",
        "16-20",
        "21-50",
        ],
        required: [true, "Number of employees is required"],
    },
    companyEmail: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    CreatedBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    logo: { secure_url: String , public_id: String },
    coverPic: [{secure_url: String , public_id: String}],

    HRs: [{
        type: Types.ObjectId,
        ref: "User",
    }],
    bannedAt: Date,
    deletedAt: Date,

    legalAttachment: { secure_url: String , public_id: String },

    approvedByAdmin: { type: Boolean, }
} , {
    timestamps: true
});




export const companyModel = mongoose.models.Company  || model("Company" , companySchema);


