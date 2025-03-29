import express from "express";
import { 
    getAllTrips, 
    getTripsByTruckerId, 
    getTripsByAdminId, 
    getTripsByStatus, 
    createTrip 
} from "../controllers/tripController";

const router = express.Router();

router.get("/", getAllTrips);
router.get("/trucker/:trucker_id", getTripsByTruckerId);
router.get("/admin/:admin_id", getTripsByAdminId);
router.get("/status/:status", getTripsByStatus);
router.post("/", createTrip);

export default router;
