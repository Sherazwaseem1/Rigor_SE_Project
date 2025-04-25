import express from "express";
import { estimateTripCostWithLLM } from "../controllers/LLMController"; 

const router = express.Router();
router.post("/estimate", estimateTripCostWithLLM);

export default router;
