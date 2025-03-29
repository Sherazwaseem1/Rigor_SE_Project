import { Request, Response } from "express";
import Truck from "../models/truck";

// 🟢 Get all trucks
export const getAllTrucks = async (req: Request, res: Response): Promise<void> => {
    try {
        const trucks = await Truck.find();
        res.status(200).json(trucks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trucks", details: error });
    }
};

// 🟣 Create a new truck
export const createTruck = async (req: Request, res: Response): Promise<void> => {
    try {
        const { truck_id, license_plate, chassis_number, capacity, assigned_trucker_id } = req.body;

        // ✅ Ensure required fields are provided
        if (!truck_id || !license_plate || !chassis_number || !capacity) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        // ✅ Ensure assigned_trucker_id is a valid number (if provided)
        if (assigned_trucker_id && typeof assigned_trucker_id !== "number") {
            res.status(400).json({ error: "assigned_trucker_id must be a number" });
            return;
        }

        // ✅ Create new truck instance
        const newTruck = new Truck({
            truck_id,
            license_plate,
            chassis_number,
            capacity,
            assigned_trucker_id: assigned_trucker_id || undefined  // ✅ Store only if provided
        });

        await newTruck.save();
        res.status(201).json(newTruck);
    } catch (error) {
        res.status(400).json({ error: "Failed to create truck", details: error });
    }
};
