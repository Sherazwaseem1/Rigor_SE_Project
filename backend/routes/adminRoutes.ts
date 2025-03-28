import express from "express";
import { getAllAdmins, createAdmin } from "../controllers/adminController";

const router = express.Router();

router.get("/", getAllAdmins);
router.post("/", createAdmin);

export default router;
