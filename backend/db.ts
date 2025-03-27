import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "sample_mflix", // Ensure you connect to the correct DB
    });
    console.log(`✅ Connected to MongoDB: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};


// Demo of branches 