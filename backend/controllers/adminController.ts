import { Request, Response } from "express";
import Admin from "../models/admin";

// 🟢 Get all admins
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admins", details: error });
    }
};

// 🟣 Get an admin by admin_id
export const getAdminById = async (req: Request, res: Response): Promise<void> => {
    try {
        const admin = await Admin.findOne({ admin_id: Number(req.params.id) });

        if (!admin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admin", details: error });
    }
};
// 🟣 Get an admin by email
export const getAdminByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const admin = await Admin.findOne({ email: req.params.email });

        if (!admin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admin", details: error });
    }
};

// 🟢 Create a new admin
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const newAdmin = new Admin(req.body);
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(400).json({ error: "Failed to create admin", details: error });
    }
};

// 🟠 Update an admin by admin_id
export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedAdmin = await Admin.findOneAndUpdate(
            { admin_id: Number(req.params.id) },
            req.body,
            { new: true }
        );

        if (!updatedAdmin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }

        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(400).json({ error: "Failed to update admin", details: error });
    }
};

// 🔴 Delete an admin by admin_id
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedAdmin = await Admin.findOneAndDelete({ admin_id: Number(req.params.id) });

        if (!deletedAdmin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }

        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete admin", details: error });
    }
};
