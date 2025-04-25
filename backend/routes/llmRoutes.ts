import express from "express";
import { estimateTripCostWithLLM } from "../controllers/llmController"; 

const router = express.Router();
router.post("/estimate", estimateTripCostWithLLM);

export default router;
