import { Request, Response } from "express";
import Trip from "../models/trip";

export const getAllTrips = async (req: Request, res: Response) => {
    try {
        const trips = await Trip.find();
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips", details: error });
    }
};
