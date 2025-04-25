import { Request, Response } from "express";
import Reimbursement from "../models/reimbursement";
import mongoose from "mongoose";  // For Decimal128

// 🟢 Get all reimbursements
export const getAllReimbursements = async (req: Request, res: Response): Promise<void> => {
    try {
        const reimbursements = await Reimbursement.find();
        res.status(200).json(reimbursements);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reimbursements", details: error });
    }
};

// 🟣 Create a new reimbursement
export const createReimbursement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trip_id, amount, receipt_url, status, comments, admin_id } = req.body;

        // ✅ Ensure required fields are provided
        if (!trip_id || !amount || !receipt_url || !status || !admin_id) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        // Find the highest existing reimbursement_id
        const maxReimbursement = await Reimbursement.findOne().sort({ reimbursement_id: -1 });

        // Set the new reimbursement_id to max(currendid) + 1 or 1 if no records exist
        const newReimbursementId = maxReimbursement ? maxReimbursement.reimbursement_id + 1 : 1;

        const newReimbursement = new Reimbursement({
            reimbursement_id: newReimbursementId, // Use the generated ID
            trip_id: Number(trip_id),  // ✅ Ensure numeric type
            amount,
            receipt_url,
            status,
            comments,
            admin_id: Number(admin_id) // ✅ Ensure numeric type
        });

        await newReimbursement.save();
        res.status(201).json(newReimbursement);
    } catch (error) {
        res.status(400).json({ error: "Failed to create reimbursement", details: error });
    }
};

// 🔵 Get reimbursements by trip ID
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

// 🟠 Get reimbursements by admin ID
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

// 🟡 Get reimbursements by status (e.g., "Pending", "Approved", "Rejected")
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

/* ─── NEW HELPERS ──────────────────────────────────────────────── */
const findByNumericId = (id: number) =>
    ({ reimbursement_id: id } as const);
  
  /* ─── ✅  Approve reimbursement  (PATCH  /:id/approve) ────────── */
/* ─── ✅  Approve reimbursement  (PATCH  /:id/approve) ────────── */
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
  
/* ─── ✅  Modify reimbursement  (PATCH  /:id)  ------------------- */
export const updateReimbursement = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.reimbursement_id);
      const { amount, comments } = req.body;
  
      // build update object dynamically
      const update: any = {};
      if (amount !== undefined) {
        // Fix: Properly convert amount to string first
        update.amount = mongoose.Types.Decimal128.fromString(amount.toString());
      }
      if (comments !== undefined) {
        // fetch existing so we can append
        const existing = (await Reimbursement.findOne(findByNumericId(id)))?.comments || "";
        update.comments = existing
          ? `${existing}\n${comments}`    // concatenate on new line
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
      console.error("Update error:", err);
      res.status(500).json({ error: "Failed to update reimbursement", details: err });
    }
};