import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface
interface ITrip extends Document {
    trip_id: number;
    trucker_id: number;
    truck_id: number;
    start_location: string;
    end_location: string;
    start_time: Date;
    end_time?: Date;
    status: string;
    distance: number;
    assigned_by_admin_id: number;
    trip_rating?: number;
    expected_cost?: number; 
}


// Define Mongoose schema
const TripSchema = new Schema<ITrip>({
    trip_id: { type: Number, unique: true, required: true },
    trucker_id: { type: Number, required: true }, 
    truck_id: { type: Number, required: true }, 
    start_location: { type: String, required: true },
    end_location: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date },
    status: { type: String, required: true },
    distance: { type: Number, required: true },
    assigned_by_admin_id: { type: Number, required: true }, 
    trip_rating: { type: Number },
    expected_cost: { type: Number } 
});


// Export model
const Trip = mongoose.model<ITrip>("Trip", TripSchema);
export default Trip;
