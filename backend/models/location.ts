import mongoose, { Schema, Document } from "mongoose";


interface ILocation extends Document {
    location_id: number;
    trip_id: number; 
    latitude: number;
    longitude: number;
    timestamp: Date;
}

const LocationSchema = new Schema<ILocation>({
    location_id: { type: Number, unique: true, required: true },
    trip_id: { type: Number, required: true, ref: "Trip" }, 
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now } 
});

const Location = mongoose.model<ILocation>("Location", LocationSchema);
export default Location;
