import mongoose from "mongoose";

const connectDB = async () => {

    await mongoose.connect(process.env.DB_URI , {
        serverSelectionTimeoutMS: 5000,
    }).then( (res) => {
        console.log("Connected to Mongo DB", res.connection.db.databaseName );
    }).catch((err) => {
        console.error(" Error connecting to Mongo DB ", err);
    })
};


export default connectDB;