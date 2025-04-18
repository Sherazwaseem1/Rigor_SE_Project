import express from "express";
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminByEmail,
  updateAdminProfilePic,
  getAdminProfilePic  
} from "../controllers/adminController";

const router = express.Router();

router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);
router.get("/email/:email", getAdminByEmail);
router.patch("/profile-pic/:adminId", updateAdminProfilePic); // ✅ New route
router.get("/profile-pic/:id", getAdminProfilePic);

export default router;
