import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./db"; 

import Admin from "./models/admin";
import Trucker from "./models/trucker";
import Truck from "./models/truck";
import Trip from "./models/trip";
import Reimbursement from "./models/reimbursement";
import Location from "./models/location";
import truckerRoutes from "./routes/truckerRoutes"; 
import adminRoutes from "./routes/adminRoutes";
import reimbursementRoutes from "./routes/reimbursementRoutes";
import tripRoutes from "./routes/tripRoutes";
import truckRoutes from "./routes/truckRoutes";
import locationRoutes from "./routes/locationRoutes"; 



const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running..." });
});

// 🚛 Fetch all truckers
app.get("/truckers", async (req: Request, res: Response) => {
  try {
    const truckers = await Trucker.find();
    res.json(truckers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching truckers" });
  }
});

// 🚚 Fetch all trucks
app.get("/trucks", async (req: Request, res: Response) => {
  try {
    const trucks = await Truck.find();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: "Error fetching trucks" });
  }
});

// 📍 Fetch all locations
app.get("/locations", async (req: Request, res: Response) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: "Error fetching locations" });
  }
});

// 🏆 Fetch all reimbursements
app.get("/reimbursements", async (req: Request, res: Response) => {
  try {
    const reimbursements = await Reimbursement.find();
    res.json(reimbursements);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reimbursements" });
  }
});

// 📅 Fetch all trips
app.get("/trips", async (req: Request, res: Response) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: "Error fetching trips" });
  }
});

// 👨‍💼 Fetch all admins
app.get("/admins", async (req: Request, res: Response) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Error fetching admins" });
  }
});


// CRUD OPERATIONS Routes
app.use("/api/truckers", truckerRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/reimbursements", reimbursementRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/locations", locationRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
