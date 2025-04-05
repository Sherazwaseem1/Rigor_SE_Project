import { Request, Response } from "express";
import Trip from "../models/trip";

// 🟢 Get all trips
export const getAllTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const trips = await Trip.find();
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips", details: error });
    }
};

// 🔵 Get trips by trucker ID
export const getTripsByTruckerId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trucker_id } = req.params;
        const trips = await Trip.find({ trucker_id: Number(trucker_id) });

        if (!trips.length) {
            res.status(404).json({ error: "No trips found for this trucker ID" });
            return;
        }

        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips", details: error });
    }
};

// 🟣 Get trips by admin ID
export const getTripsByAdminId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { admin_id } = req.params;
        const trips = await Trip.find({ assigned_by_admin_id: Number(admin_id) });

        if (!trips.length) {
            res.status(404).json({ error: "No trips found for this admin ID" });
            return;
        }

        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips", details: error });
    }
};

// 🟠 Get trips by status (e.g., "Completed", "In Progress", etc.)
export const getTripsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;
        const trips = await Trip.find({ status });

        if (!trips.length) {
            res.status(404).json({ error: `No trips found with status: ${status}` });
            return;
        }

        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips", details: error });
    }
};

// 🟢 Create a new trip
export const createTrip = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            trucker_id,
            truck_id,
            start_location,
            end_location,
            start_time,
            end_time,
            status,
            distance,
            assigned_by_admin_id,
            trip_rating
        } = req.body;

        // ✅ Ensure required fields are provided (excluding trip_id now)
        if (!trucker_id || !truck_id || !start_location || !end_location || !start_time || !status || !distance || !assigned_by_admin_id) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        // ✅ Get the max existing trip_id
        const latestTrip = await Trip.findOne().sort({ trip_id: -1 }).exec();
        const newTripId = latestTrip ? latestTrip.trip_id + 1 : 1;

        const newTrip = new Trip({
            trip_id: newTripId,
            trucker_id: Number(trucker_id),
            truck_id: Number(truck_id),
            start_location,
            end_location,
            start_time: new Date(start_time),
            end_time: end_time ? new Date(end_time) : undefined,
            status,
            distance: Number(distance),
            assigned_by_admin_id: Number(assigned_by_admin_id),
            trip_rating: trip_rating ? Number(trip_rating) : undefined
        });

        await newTrip.save();
        res.status(201).json(newTrip);
    } catch (error) {
        res.status(400).json({ error: "Failed to create trip", details: error });
    }
};

