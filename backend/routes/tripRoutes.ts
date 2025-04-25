import express from "express";
import { 
    getAllTrips, 
    getTripsByTruckerId, 
    getTripsByAdminId, 
    getTripsByStatus, 
    createTrip,
    updateTrip,
    rateTrip
} from "../controllers/tripController";

const router = express.Router();

router.get("/", getAllTrips);
router.get("/trucker/:trucker_id", getTripsByTruckerId);
router.get("/admin/:admin_id", getTripsByAdminId);
router.get("/status/:status", getTripsByStatus);
router.post("/", createTrip);
router.patch('/:trip_id', updateTrip);   // ← new route
router.patch("/:trip_id/rating", rateTrip);


export default router;
