import express from "express";
import { getAllTrucks } from "../controllers/truckController";

const router = express.Router();

router.get("/", getAllTrucks);

export default router;
