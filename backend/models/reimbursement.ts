import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface
interface IReimbursement extends Document {
    reimbursement_id: number;
    trip_id: mongoose.Types.ObjectId;
    amount: mongoose.Types.Decimal128;
    receipt_url: string;
    status: string;
    comments?: string;
    admin_id: mongoose.Types.ObjectId;
}

// Define Mongoose schema
const ReimbursementSchema = new Schema<IReimbursement>({
    reimbursement_id: { type: Number, unique: true, required: true },
    trip_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    receipt_url: { type: String, required: true },
    status: { type: String, required: true },
    comments: { type: String },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
});

// Export model
const Reimbursement = mongoose.model<IReimbursement>("Reimbursement", ReimbursementSchema);
export default Reimbursement;
