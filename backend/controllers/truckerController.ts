import { Request, Response } from "express";
import Trucker from "../models/trucker";


export const createTrucker = async (req: Request, res: Response): Promise<void> => {
  try {
    const lastTrucker = await Trucker.findOne().sort({ trucker_id: -1 });
    const newId = lastTrucker ? lastTrucker.trucker_id + 1 : 1;
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

export const getAllTruckers = async (req: Request, res: Response): Promise<void> => {
  try {
    const truckers = await Trucker.find();
    res.status(200).json(truckers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch truckers", details: error });
  }
};

export const getTruckerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const trucker = await Trucker.findOne({ trucker_id: Number(req.params.id) });
    if (!trucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }
    res.status(200).json(trucker);
  } catch (error) {
    res.status(500).json({ error: "Error fetching trucker", details: error });
  }
};

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

export const updateTruckerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const truckerId = Number(req.params.id);

    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    const updatedTrucker = await Trucker.findOneAndUpdate(
      { trucker_id: truckerId },
      { status },
      { new: true }
    );

    if (!updatedTrucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }

    res.status(200).json(updatedTrucker);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status", details: error });
  }
};

export const updateTruckerProfilePic = async (req: Request, res: Response): Promise<void> => {
  try {
    const truckerId = Number(req.params.id);
    const { profile_pic_url } = req.body;

    if (!profile_pic_url) {
      res.status(400).json({ error: "profile_pic_url is required" });
      return;
    }

    const updatedTrucker = await Trucker.findOneAndUpdate(
      { trucker_id: truckerId },
      { profile_pic_url },
      { new: true }
    );

    if (!updatedTrucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }

    res.status(200).json(updatedTrucker);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile picture", details: error });
  }
};


export const getTruckerProfilePic = async (req: Request, res: Response): Promise<void> => {
  try {
    const truckerId = Number(req.params.id);
    const trucker = await Trucker.findOne({ trucker_id: truckerId });

    if (!trucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }

    res.status(200).json({ profile_pic_url: trucker.profile_pic_url });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile picture", details: error });
  }
};



export const updateTruckerRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const truckerId = Number(req.params.id);
    const { rating } = req.body;

    if (rating == null || isNaN(rating)) {
      res.status(400).json({ error: "A valid rating must be provided" });
      return;
    }

    const updatedTrucker = await Trucker.findOneAndUpdate(
      { trucker_id: truckerId },
      { rating },
      { new: true }
    );

    if (!updatedTrucker) {
      res.status(404).json({ error: "Trucker not found" });
      return;
    }

    res.status(200).json(updatedTrucker);
  } catch (error) {
    res.status(500).json({ error: "Failed to update rating", details: error });
  }
};