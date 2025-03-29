import { Request, Response } from "express";
import Location from "../models/location";

// Get all locations
// Get all locations
export const getAllLocations = async (req: Request, res: Response) => {
    try {
        const locations = await Location.find(); // ❌ No populate here
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch locations", details: error });
    }
};

// Get a single location by ID
export const getLocationById = async (req: Request, res: Response) => {
    try {
        const location = await Location.findOne({ location_id: Number(req.params.id) }); // ✅ Fix here
        if (!location) {
            res.status(404).json({ error: "Location not found" });
            return;
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch location", details: error });
    }
};

// Create a new location
export const createLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { location_id, trip_id, latitude, longitude, timestamp } = req.body;

        // ✅ Ensure required fields are provided
        if (!location_id || !trip_id || !latitude || !longitude) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const newLocation = new Location({
            location_id: Number(location_id),
            trip_id: Number(trip_id), // Ensuring number type
            latitude: Number(latitude),
            longitude: Number(longitude),
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });

        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (error) {
        res.status(500).json({ error: "Failed to create location", details: error });
    }
};

// Update a location by ID
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedLocation = await Location.findOneAndUpdate(
            { location_id: Number(req.params.id) },
            { $set: req.body },
            { new: true }
        ).exec();

        if (!updatedLocation) {
            res.status(404).json({ error: "Location not found" });
            return;
        }

        res.status(200).json(updatedLocation);
    } catch (error) {
        res.status(500).json({ error: "Failed to update location", details: error });
    }
};

// Delete a location by ID
export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedLocation = await Location.findOneAndDelete({ location_id: Number(req.params.id) }).exec();
        if (!deletedLocation) {
            res.status(404).json({ error: "Location not found" });
            return;
        }
        res.status(200).json({ message: "Location deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete location", details: error });
    }
};
