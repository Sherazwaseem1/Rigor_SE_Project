import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./db"; 


import truckerRoutes from "./routes/truckerRoutes"; 
import adminRoutes from "./routes/adminRoutes";
import reimbursementRoutes from "./routes/reimbursementRoutes";
import tripRoutes from "./routes/tripRoutes";
import truckRoutes from "./routes/truckRoutes";
import locationRoutes from "./routes/locationRoutes"; 
import llmRoutes from "./routes/llmRoutes";
import emailRoutes from "./routes/emailRoutes";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running..." });
});

app.use("/api/truckers", truckerRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/reimbursements", reimbursementRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/locations", locationRoutes); 
app.use("/api/llm", llmRoutes); 
app.use("/api/email", emailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
