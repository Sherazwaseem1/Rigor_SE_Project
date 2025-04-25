import mongoose, { Schema, Document } from "mongoose";

interface IReimbursement extends Document {
    reimbursement_id: number;
    trip_id: number; 
    amount: mongoose.Types.Decimal128;
    receipt_url: string;
    status: string;
    comments?: string;
    admin_id: number;  
}

const ReimbursementSchema = new Schema<IReimbursement>({
    reimbursement_id: { type: Number, unique: true, required: true },
    trip_id: { type: Number, required: true, ref: "Trip" }, 
    amount: { type: Schema.Types.Decimal128, required: true },
    receipt_url: { type: String, required: true },
    status: { type: String, required: true },
    comments: { type: String },
    admin_id: { type: Number, required: true, ref: "Admin" } 
});

const Reimbursement = mongoose.model<IReimbursement>("Reimbursement", ReimbursementSchema);
export default Reimbursement;
