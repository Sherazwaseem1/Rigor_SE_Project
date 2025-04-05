import { getAllTrucks, createTruck, getTruckByTruckerId } from "../controllers/truckController";

import express from "express";

const router = express.Router();

router.get("/by-trucker/:truckerId", getTruckByTruckerId);
router.get("/", getAllTrucks);
router.post("/", createTruck);

// ✅ Export the router
export default router;
