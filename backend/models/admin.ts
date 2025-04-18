import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface
interface IAdmin extends Document {
  admin_id: number;
  name: string;
  email: string;
  phone_number: string;
  profile_pic_url?: string; // ✅ Optional profile image field
}

// Define Mongoose schema
const AdminSchema = new Schema<IAdmin>({
  admin_id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  profile_pic_url: { type: String }, // ✅ Mongoose schema field
});

// Export the Mongoose model
const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin;
