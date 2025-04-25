import { Request, Response } from "express";
import Admin from "../models/admin";

export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admins", details: error });
    }
};


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


export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const latestAdmin = await Admin.findOne().sort({ admin_id: -1 });
        const nextId = latestAdmin ? latestAdmin.admin_id + 1 : 1;

        const newAdmin = new Admin({
            ...req.body,
            admin_id: nextId
        });

        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(400).json({ error: "Failed to create admin", details: error });
    }
};

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

export const updateAdminProfilePic = async (req: Request, res: Response): Promise<void> => {
    
    const { adminId } = req.params;
    const { profile_pic_url } = req.body;

    try {
        const updatedAdmin = await Admin.findOneAndUpdate(
            { admin_id: Number(adminId) },
            { profile_pic_url },
            { new: true }
        );

        if (!updatedAdmin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }

        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.error("Error updating admin profile picture:", error);
        res.status(500).json({ error: "Failed to update profile picture", details: error });
    }
};


export const getAdminProfilePic = async (req: Request, res: Response): Promise<void> => {
    try {
        const admin = await Admin.findOne(
            { admin_id: Number(req.params.id) },
            { profile_pic_url: 1, _id: 0 } 
        );

        if (!admin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }

        res.status(200).json({ profile_pic_url: admin.profile_pic_url });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile picture", details: error });
    }
};
