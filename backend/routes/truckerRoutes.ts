import express from "express";
import { 
    getAllTruckers, 
    getTruckerById, 
    getTruckerByEmail,  // ✅ Import the new function
    createTrucker, 
    updateTrucker, 
    deleteTrucker,
    updateTruckerStatus,
    updateTruckerProfilePic,
    getTruckerProfilePic,
    getTruckersWithoutTruck,
} from "../controllers/truckerController";

const router = express.Router();

// ✅ Define routes
router.get("/", getAllTruckers);
router.get("/:id", getTruckerById);
router.get("/email/:email", getTruckerByEmail); 
router.post("/", createTrucker);
router.put("/:id", updateTrucker);
router.delete("/:id", deleteTrucker);
router.patch("/status/:id", updateTruckerStatus);
router.patch('/profile-pic/:id', updateTruckerProfilePic);
router.get('/profile-pic/:id', getTruckerProfilePic);
router.get("/without-truck", getTruckersWithoutTruck);


export default router;
