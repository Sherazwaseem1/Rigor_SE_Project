import { Request, Response } from "express";
import Reimbursement from "../models/reimbursement";

export const getAllReimbursements = async (req: Request, res: Response) => {
    try {
        const reimbursements = await Reimbursement.find();
        res.json(reimbursements);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reimbursements", details: error });
    }
};
