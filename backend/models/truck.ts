import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface
interface ITruck extends Document {
    truck_id: number;
    license_plate: string;
    chassis_number: string;
    capacity: number;
    assigned_trucker_id?: mongoose.Types.ObjectId;
}

// Define Mongoose schema
const TruckSchema = new Schema<ITruck>({
    truck_id: { type: Number, unique: true, required: true },
    license_plate: { type: String, required: true },
    chassis_number: { type: String, required: true },
    capacity: { type: Number, required: true },
    assigned_trucker_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trucker" }
});

// Export model
const Truck = mongoose.model<ITruck>("Truck", TruckSchema);
export default Truck;
