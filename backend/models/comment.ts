import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  movie_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Movie" },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now } // Default to current date
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
