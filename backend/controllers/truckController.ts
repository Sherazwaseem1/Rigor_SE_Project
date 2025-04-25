import { Request, Response } from "express";
import Truck from "../models/truck";
import Trucker from "../models/trucker";

export const getAllTrucks = async (req: Request, res: Response): Promise<void> => {
    try {
        const trucks = await Truck.find();
        res.status(200).json(trucks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trucks", details: error });
    }
};

export const createTruck = async (req: Request, res: Response): Promise<void> => {
    try {
        const { license_plate, chassis_number, capacity, assigned_trucker_id } = req.body;

        if (!license_plate || !chassis_number || !capacity) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        if (assigned_trucker_id && typeof assigned_trucker_id !== "number") {
            res.status(400).json({ error: "assigned_trucker_id must be a number" });
            return;
        }

        const maxTruck = await Truck.findOne().sort({ truck_id: -1 }); 
        const newTruckId = maxTruck ? maxTruck.truck_id + 1 : 1; 
        const newTruck = new Truck({
            truck_id: newTruckId,
            license_plate,
            chassis_number,
            capacity,
            assigned_trucker_id: assigned_trucker_id || undefined, 
        });

        await newTruck.save();
        res.status(201).json(newTruck);
    } catch (error) {
        res.status(400).json({ error: "Failed to create truck", details: error });
    }
};

export const getTruckByTruckerId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { truckerId } = req.params;
        const truck = await Truck.findOne({ assigned_trucker_id: Number(truckerId) });

        if (!truck) {
            res.status(404).json({ error: "Truck not found for this trucker ID" });
            return;
        }

        res.status(200).json(truck);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch truck", details: error });
    }
};

export const getTruckersWithoutTruck = async (req: Request, res: Response): Promise<void> => {
    try {
      const allTruckers = await Trucker.find();
      const assignedTrucks = await Truck.find({ assigned_trucker_id: { $ne: null } });
      const assignedTruckerIds = assignedTrucks.map(truck => truck.assigned_trucker_id);
      
      const unassignedTruckers = allTruckers.filter(
        trucker => !assignedTruckerIds.includes(trucker.trucker_id)
      );
  
      res.status(200).json(unassignedTruckers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
  