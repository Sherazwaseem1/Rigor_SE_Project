import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./db";
import Comment from "./models/comment"; // Import the Comment model

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running..." });
});

// New route to fetch comments from MongoDB
app.get("/comments", async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find(); // Fetch all comments
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Error fetching comments" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
