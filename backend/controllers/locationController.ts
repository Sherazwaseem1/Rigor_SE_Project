import { Request, Response } from "express";
import Location from "../models/location"; // Ensure the correct import path

// Get all locations
export const getAllLocations = async (req: Request, res: Response) => {
    try {
        const locations = await Location.find().populate("trip_id");
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch locations", details: error });
    }
};

// Get a single location by ID
export const getLocationById = async (req: Request, res: Response) => {
    try {
        const location = await Location.findById(req.params.id).populate("trip_id");
        if (!location) res.status(404).json({ error: "Location not found" });
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch location", details: error });
    }
};

// Create a new location
export const createLocation = async (req: Request, res: Response) => {
    try {
        const { location_id, trip_id, latitude, longitude, timestamp } = req.body;
        const newLocation = new Location({ location_id, trip_id, latitude, longitude, timestamp });
        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (error) {
        res.status(500).json({ error: "Failed to create location", details: error });
    }
};

// Update a location by ID
export const updateLocation = async (req: Request, res: Response) => {
    try {
        const updatedLocation = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedLocation) res.status(404).json({ error: "Location not found" });
        res.status(200).json(updatedLocation);
    } catch (error) {
        res.status(500).json({ error: "Failed to update location", details: error });
    }
};

// Delete a location by ID
export const deleteLocation = async (req: Request, res: Response) => {
    try {
        const deletedLocation = await Location.findByIdAndDelete(req.params.id);
        if (!deletedLocation) res.status(404).json({ error: "Location not found" });
        res.status(200).json({ message: "Location deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete location", details: error });
    }
};
