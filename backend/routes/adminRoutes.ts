import express from "express";
import { getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, getAdminByEmail } from "../controllers/adminController";

const router = express.Router();

router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);   // ✅ Update admin
router.delete("/:id", deleteAdmin); // ✅ Delete admin
router.get("/email/:email", getAdminByEmail);

export default router;
