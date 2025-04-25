import mongoose, { Schema, Document } from "mongoose";

interface ITrucker extends Document {
  trucker_id: number;
  name: string;
  phone_number: string;
  email: string;
  rating: number;
  status: string;
  age: number;
  gender: string;
  profile_pic_url?: string | null; 
}

const TruckerSchema = new Schema<ITrucker>({
  trucker_id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true },
  status: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  profile_pic_url: { type: String, default: null }, 
});

const Trucker = mongoose.model<ITrucker>("Trucker", TruckerSchema);
export default Trucker;
