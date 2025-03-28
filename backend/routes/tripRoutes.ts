import express from "express";
import { getAllTrips } from "../controllers/tripController";

const router = express.Router();

router.get("/", getAllTrips);

export default router;
