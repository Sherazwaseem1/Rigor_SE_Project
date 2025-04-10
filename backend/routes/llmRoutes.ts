import express from "express";
import { estimateTripCostWithLLM } from "../controllers/LLMController"; // Make sure the path is correct

const router = express.Router();

// POST /api/llm/estimate
router.post("/estimate", estimateTripCostWithLLM);

export default router;
