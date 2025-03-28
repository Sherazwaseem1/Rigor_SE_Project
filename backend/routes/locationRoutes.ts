import express from "express";
import { 
    getAllLocations, 
    getLocationById, 
    createLocation, 
    updateLocation, 
    deleteLocation 
} from "../controllers/locationController";

const router = express.Router();

// Define Routes
router.get("/", getAllLocations); // Get all locations
router.get("/:id", getLocationById); // Get a specific location by ID
router.post("/", createLocation); // Create a new location
router.put("/:id", updateLocation); // Update a location
router.delete("/:id", deleteLocation); // Delete a location

export default router;
