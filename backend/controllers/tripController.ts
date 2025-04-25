import { Request, Response } from "express";
import Trip from "../models/trip";

export const getAllTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const trips = await Trip.find();
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips", details: error });
    }
};

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
            trip_rating,
            expected_cost 
        } = req.body;

        if (
            !trucker_id ||
            !truck_id ||
            !start_location ||
            !end_location ||
            !start_time ||
            !status ||
            !distance ||
            !assigned_by_admin_id ||
            !expected_cost 
        ) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

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
            trip_rating: trip_rating ? Number(trip_rating) : undefined,
            expected_cost: expected_cost ? Number(expected_cost) : undefined 
        });

        await newTrip.save();
        res.status(201).json(newTrip);
    } catch (error) {
        res.status(400).json({ error: "Failed to create trip", details: error });
    }
};


export const updateTrip = async (req: Request, res: Response): Promise<void> => {
    try {
      const tripId = Number(req.params.trip_id); 
      const updates = req.body;
      
      const updated = await Trip.findOneAndUpdate(
        { trip_id: tripId },
        updates,
        { new: true }
      );
      
      if (!updated) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }
      
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update trip', details: err });
    }
  };

export const rateTrip = async (req: Request, res: Response): Promise<void> => {
    try {
      const tripId = Number(req.params.trip_id);
      const { rating } = req.body;
  
      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ error: "Invalid rating. Must be between 1 and 5." });
        return;
      }
  
      const updatedTrip = await Trip.findOneAndUpdate(
        { trip_id: tripId },
        { trip_rating: rating },
        { new: true }
      );
  
      if (!updatedTrip) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }
  
      res.status(200).json(updatedTrip);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trip rating", details: error });
    }
  };