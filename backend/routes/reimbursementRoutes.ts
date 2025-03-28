import express from "express";
import { getAllReimbursements } from "../controllers/reimursementController";

const router = express.Router();

router.get("/", getAllReimbursements);

export default router;
