import { Request, Response } from "express";
import Truck from "../models/truck";

export const getAllTrucks = async (req: Request, res: Response) => {
    try {
        const trucks = await Truck.find();
        res.json(trucks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trucks", details: error });
    }
};
