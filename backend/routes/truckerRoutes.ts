import express from "express";
import { 
    getAllTruckers, 
    getTruckerById, 
    getTruckerByEmail,  
    createTrucker, 
    updateTrucker, 
    deleteTrucker,
    updateTruckerStatus,
    updateTruckerProfilePic,
    getTruckerProfilePic,
    updateTruckerRating
} from "../controllers/truckerController";

const router = express.Router();

router.get("/", getAllTruckers);
router.get("/:id", getTruckerById);
router.get("/email/:email", getTruckerByEmail); 
router.post("/", createTrucker);
router.put("/:id", updateTrucker);
router.delete("/:id", deleteTrucker);
router.patch("/status/:id", updateTruckerStatus);
router.patch('/profile-pic/:id', updateTruckerProfilePic);
router.get('/profile-pic/:id', getTruckerProfilePic);
router.patch("/rating/:id", updateTruckerRating);

export default router;
