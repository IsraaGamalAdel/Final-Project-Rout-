import  mongoose, { model, Schema, Types } from "mongoose";
import * as authMiddlewareTypes from './../../middleware/auth.middleware.js';
import * as bcrypt from "bcrypt";
import CryptoJS from "crypto-js";


const userSchema = new Schema({
    firstName : {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
        trim: true
    },
    lastName : {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
        trim: true
    },
    email : {
        type: String,
        required:true,
        unique: [true ,`already exist email`],
    },
    confirmEmail: {
        type: Boolean,
        default:false,
    },
    //tempEmail
    tempEmail: String,
    //OTP Email
    emailOTP: String,
    //OTP update Email
    updateEmailOTP: String,
    password:{
        type: String,
        required: true
    },
    // OTP Forgot-Password
    forgotPasswordOTP: String,
    provider: {
        type: String,
        enum: Object.values(authMiddlewareTypes.providerTypes),
        default: authMiddlewareTypes.providerTypes.system
    },
    googleId:{
        type: String,
        unique: true
    },
    gender: {
        type: String,
        enum: Object.values(authMiddlewareTypes.genderTypes),
        default: authMiddlewareTypes.genderTypes.male
    },
    DOB: Date,
    phone: String,
    role: {
        type: String,
        enum: Object.values(authMiddlewareTypes.roleTypes),
        default: "User",
    },
    profilePic: {secure_url: String , public_id: String},
    coverPic: [{secure_url: String , public_id: String}],
    
    deleted: {type: Boolean},
    changeCredentialsTime: Date,
    otpBlockedUntil: Date,

    //OTP
    otpExpiresAt: Date,
    otpAttempts: Number,
    
    deletedAt: Date,
    bannedAt: Date,
    updatedBy: {type:Types.ObjectId , ref: "User"}
},{
    timestamps: true,
    toObject:{ virtuals: true},
    toJSON: {
        virtuals: true
    }
})

userSchema.virtual('userName').set(function(value) {
    this.firstName = value.split(" ")[0]
    this.lastName = value.split(" ")[1]
}).get(function(){
    return this.firstName + " " + this.lastName
})

// hash password and encrypt phone ( Hooks )
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUND));
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isModified("phone")) {
        const encryptedMobile = CryptoJS.AES.encrypt(this.phone, process.env.ENCRYPTION_PHONE_SIGNATURE).toString();
        this.phone = encryptedMobile;
    }
    next();
});
userSchema.methods.comparePassword  = async function(plainPassword){
    return await bcrypt.compare(plainPassword , this.password)
}

userSchema.methods.getDecryptedMobile = function () {
    return CryptoJS.AES.decrypt(this.phone, process.env.ENCRYPTION_PHONE_SIGNATURE).toString(CryptoJS.enc.Utf8);
};



export const userModel = mongoose.models.User || model("User" , userSchema);