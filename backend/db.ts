import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;


const connectDB = async (): Promise<void> => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI as string);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;
