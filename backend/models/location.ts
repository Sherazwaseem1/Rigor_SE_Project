import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface
interface ILocation extends Document {
    location_id: number;
    trip_id: number; // Changed from ObjectId to Number
    latitude: number;
    longitude: number;
    timestamp: Date;
}

// Define Mongoose schema
const LocationSchema = new Schema<ILocation>({
    location_id: { type: Number, unique: true, required: true },
    trip_id: { type: Number, required: true, ref: "Trip" },  // ✅ Now a number
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now } // Default timestamp to current date
});

// Export the Mongoose model
const Location = mongoose.model<ILocation>("Location", LocationSchema);
export default Location;
