import { Request, Response } from "express";
import Reimbursement from "../models/reimbursement";
import mongoose from "mongoose";  

export const getAllReimbursements = async (req: Request, res: Response): Promise<void> => {
    try {
        const reimbursements = await Reimbursement.find();
        res.status(200).json(reimbursements);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reimbursements", details: error });
    }
};

export const createReimbursement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trip_id, amount, receipt_url, status, comments, admin_id } = req.body;
        if (!trip_id || !amount || !receipt_url || !status || !admin_id) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const maxReimbursement = await Reimbursement.findOne().sort({ reimbursement_id: -1 });
        const newReimbursementId = maxReimbursement ? maxReimbursement.reimbursement_id + 1 : 1;

        const newReimbursement = new Reimbursement({
            reimbursement_id: newReimbursementId,
            trip_id: Number(trip_id), 
            amount,
            receipt_url,
            status,
            comments,
            admin_id: Number(admin_id) 
        });

        await newReimbursement.save();
        res.status(201).json(newReimbursement);
    } catch (error) {
        res.status(400).json({ error: "Failed to create reimbursement", details: error });
    }
};

export const getReimbursementsByTripId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trip_id } = req.params;
        const reimbursements = await Reimbursement.find({ trip_id: Number(trip_id) });

        if (!reimbursements.length) {
            res.status(404).json({ error: "No reimbursements found for this trip ID" });
            return;
        }

        res.status(200).json(reimbursements);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reimbursements", details: error });
    }
};

export const getReimbursementsByAdminId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { admin_id } = req.params;
        const reimbursements = await Reimbursement.find({ admin_id: Number(admin_id) });

        if (!reimbursements.length) {
            res.status(404).json({ error: "No reimbursements found for this admin ID" });
            return;
        }

        res.status(200).json(reimbursements);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reimbursements", details: error });
    }
};

export const getReimbursementsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;
        const reimbursements = await Reimbursement.find({ status });

        if (!reimbursements.length) {
            res.status(404).json({ error: `No reimbursements found with status: ${status}` });
            return;
        }

        res.status(200).json(reimbursements);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reimbursements", details: error });
    }
};

const findByNumericId = (id: number) =>
    ({ reimbursement_id: id } as const);
  
 
export const approveReimbursement = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.reimbursement_id);
      const { admin_id } = req.body;
  
      const updated = await Reimbursement.findOneAndUpdate(
        findByNumericId(id),
        { status: "Approved", admin_id: Number(admin_id) },
        { new: true }
      );
  
      if (!updated) {
        res.status(404).json({ error: "Reimbursement not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to approve", details: err });
    }
};
  
export const updateReimbursement = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.reimbursement_id);
      const { amount, comments } = req.body;
      const update = {};

      if (amount !== undefined) {
        update.amount = mongoose.Types.Decimal128.fromString(amount.toString());
      }
      if (comments !== undefined) {
        const existing = (await Reimbursement.findOne(findByNumericId(id)))?.comments || "";
        update.comments = existing
          ? `${existing}\n${comments}`   
          : comments;
      }

      const updated = await Reimbursement.findOneAndUpdate(
        findByNumericId(id),
        { $set: update },
        { new: true }
      );
  
      if (!updated) {
        res.status(404).json({ error: "Reimbursement not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update reimbursement", details: err });
    }
};