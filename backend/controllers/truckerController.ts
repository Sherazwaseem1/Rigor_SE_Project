import { Request, Response } from "express";
import Trucker from "../models/trucker";

// 🟢 Create a new trucker
export const createTrucker = async (req: Request, res: Response): Promise<void> => {
  try {
    // Step 1: Find the max trucker_id
    const lastTrucker = await Trucker.findOne().sort({ trucker_id: -1 });

    // Step 2: Determine the new trucker_id
    const newId = lastTrucker ? lastTrucker.trucker_id + 1 : 1;

    // Step 3: Create and save the new trucker with the new ID
    const newTrucker = new Trucker({
      ...req.body,
      trucker_id: newId,
    });

    await newTrucker.save();
    res.status(201).json(newTrucker);
  } catch (error) {
    res.status(400).json({ error: "Failed to create trucker", details: error });
  }
};

// 🔵 Get all truckers
export const getAllTruckers = async (req: Request, res: Response): Promise<void> => {
  try {
    const truckers = await Trucker.find();
    res.status(200).json(truckers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch truckers", details: error });
  }
};

// 🟣 Get a single trucker by ID
export const getTruckerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const trucker = await Trucker.findOne({ trucker_id: Number(req.params.id) });
    if (!trucker) {
      res.status(404).json({ error: "Trucker not found" });
      return; // ✅ Explicit return to stop execution
    }
    res.status(200).json(trucker);
  } catch (error) {
    console.error("Error fetching trucker:", error);
    res.status(500).json({ error: "Error fetching trucker", details: error });
  }
};

// 🟡 Get a trucker by email
export const getTruckerByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const trucker = await Trucker.findOne({ email: req.params.email });

    if (!trucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }

    res.status(200).json(trucker);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trucker", details: error });
  }
};


// 🟠 Update a trucker
export const updateTrucker = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedTrucker = await Trucker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTrucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }
    res.status(200).json(updatedTrucker);
  } catch (error) {
    res.status(400).json({ error: "Failed to update trucker", details: error });
  }
};

// 🔴 Delete a trucker
export const deleteTrucker = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedTrucker = await Trucker.findOneAndDelete({ trucker_id: Number(req.params.id) });
    if (!deletedTrucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }
    res.status(200).json({ message: "Trucker deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete trucker", details: error });
  }
};
