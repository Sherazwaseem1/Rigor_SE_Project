import express from "express";
import { 
    getAllTruckers, 
    getTruckerById, 
    getTruckerByEmail,  // ✅ Import the new function
    createTrucker, 
    updateTrucker, 
    deleteTrucker 
} from "../controllers/truckerController";

const router = express.Router();

// ✅ Define routes
router.get("/", getAllTruckers);
router.get("/:id", getTruckerById);
router.get("/email/:email", getTruckerByEmail); 
router.post("/", createTrucker);
router.put("/:id", updateTrucker);
router.delete("/:id", deleteTrucker);

export default router;
