import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDaygCJ4NhbRdIC_NTDEXCHAiUemlmpF10");

export const estimateTripCostWithLLM = async (req: Request, res: Response) => {
  const { start_location, end_location, distance } = req.body;

  const prompt = `You are a trucking logistics expert. Estimate the total cost in PKR for a truck trip from ${start_location} to ${end_location}, covering ${distance} kilometers, based on average fuel cost, tolls, and standard expenses in Pakistan.

Reply with only a single number. No currency sign. No explanation. Just the number.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const estimatedCost = response.text().trim();

    res.status(200).json({ estimated_cost: estimatedCost });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Failed to estimate trip cost" });
  }
};
