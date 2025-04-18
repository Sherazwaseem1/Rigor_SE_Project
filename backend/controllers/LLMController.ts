// In your controller file
import { Request, Response } from "express";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

export const estimateTripCostWithLLM = async (req: Request, res: Response) => {
    
    const { start_location, end_location, distance } = req.body;
  
    try {
      const prompt = `You are a trucking logistics expert. Estimate the total cost in PKR for a truck trip from ${start_location} to ${end_location}, covering ${distance} kilometers, based on average fuel cost, tolls, and standard expenses in Pakistan.
  
  Reply with only a single number. No currency sign. No explanation. Just the number.`;
  
      const chatResponse = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
          model: "gpt-4o-mini",
          store: true,

    });
  
      const costEstimate = chatResponse.choices[0].message.content?.trim();
  
      res.status(200).json({ estimated_cost: costEstimate });
    } catch (error) {
      console.error("Error estimating cost:", error);
      res.status(500).json({ error: "Failed to estimate trip cost" });
    }
  };
  