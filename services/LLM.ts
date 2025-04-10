import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

let start_location = "Karachi, Pakistan";
let end_location = "Lahore, Pakistan";
let distance = 1200; // in km
let prompt = `Estimate the cost of a trucking trip from ${start_location} to ${end_location}, covering a distance of ${distance} km. 
Consider average fuel prices, tolls, and standard expenses in Pakistan. Give a rough estimate in PKR.`

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": prompt},
  ],
});

completion.then((result) => console.log(result.choices[0].message));