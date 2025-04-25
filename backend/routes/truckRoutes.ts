import { getAllTrucks, createTruck, getTruckByTruckerId, getTruckersWithoutTruck  } from "../controllers/truckController";

import express from "express";

const router = express.Router();

router.get("/by-trucker/:truckerId", getTruckByTruckerId);
router.get("/", getAllTrucks);
router.post("/", createTruck);
router.get("/without-truck", getTruckersWithoutTruck);

export default router;
    