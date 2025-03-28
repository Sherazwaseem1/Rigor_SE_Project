import { Request, Response } from "express";
import Admin from "../models/admin";

// CRUD functions for Admin
export const getAllAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await Admin.find();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admins", details: error });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const newAdmin = new Admin(req.body);
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(400).json({ error: "Failed to create admin", details: error });
    }
};
