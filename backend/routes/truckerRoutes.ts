import express from "express";
import { createTrucker, getAllTruckers, getTruckerById, updateTrucker, deleteTrucker } from "../controllers/truckerController";

const router = express.Router(); // ✅ Use express.Router()

router.post("/", createTrucker);  // ✅ Correct usage
router.get("/", getAllTruckers);
router.get("/:id", getTruckerById);
router.put("/:id", updateTrucker);
router.delete("/:id", deleteTrucker);

export default router;
