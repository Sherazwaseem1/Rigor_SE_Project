import { getAllTrucks, createTruck } from "../controllers/truckController";
import express from "express";

const router = express.Router();

router.get("/", getAllTrucks);
router.post("/", createTruck);

// ✅ Export the router
export default router;
