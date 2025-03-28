import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface
interface ITrip extends Document {
    trip_id: number;
    trucker_id: mongoose.Types.ObjectId;
    truck_id: mongoose.Types.ObjectId;
    start_location: string;
    end_location: string;
    start_time: Date;
    end_time?: Date;
    status: string;
    distance: number;
    assigned_by_admin_id: mongoose.Types.ObjectId;
    trip_rating?: number;
}

// Define Mongoose schema
const TripSchema = new Schema<ITrip>({
    trip_id: { type: Number, unique: true, required: true },
    trucker_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trucker", required: true },
    truck_id: { type: mongoose.Schema.Types.ObjectId, ref: "Truck", required: true },
    start_location: { type: String, required: true },
    end_location: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date },
    status: { type: String, required: true },
    distance: { type: Number, required: true },
    assigned_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    trip_rating: { type: Number }
});

// Export model
const Trip = mongoose.model<ITrip>("Trip", TripSchema);
export default Trip;
