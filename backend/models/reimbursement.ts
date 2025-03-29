import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface
interface IReimbursement extends Document {
    reimbursement_id: number;
    trip_id: number;  // Changed from ObjectId to Number
    amount: mongoose.Types.Decimal128;
    receipt_url: string;
    status: string;
    comments?: string;
    admin_id: number;  // Changed from ObjectId to Number
}

// Define Mongoose schema
const ReimbursementSchema = new Schema<IReimbursement>({
    reimbursement_id: { type: Number, unique: true, required: true },
    trip_id: { type: Number, required: true, ref: "Trip" },  // ✅ Number instead of ObjectId
    amount: { type: Schema.Types.Decimal128, required: true },
    receipt_url: { type: String, required: true },
    status: { type: String, required: true },
    comments: { type: String },
    admin_id: { type: Number, required: true, ref: "Admin" }  // ✅ Number instead of ObjectId
});

// Export model
const Reimbursement = mongoose.model<IReimbursement>("Reimbursement", ReimbursementSchema);
export default Reimbursement;
