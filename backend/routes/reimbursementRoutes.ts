import express from "express";
import {
    getAllReimbursements,
    createReimbursement,
    getReimbursementsByTripId,
    getReimbursementsByAdminId,
    getReimbursementsByStatus
} from "../controllers/reimursementController";

const router = express.Router();

router.get("/", getAllReimbursements);
router.post("/", createReimbursement);
router.get("/trip/:trip_id", getReimbursementsByTripId);
router.get("/admin/:admin_id", getReimbursementsByAdminId);
router.get("/status/:status", getReimbursementsByStatus);

export default router;
