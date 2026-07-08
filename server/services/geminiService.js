import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeImageWithGemini(imagePath, mimeType) {
  const imageBytes = fs.readFileSync(imagePath);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType,
        },
      },
      {
        text: "Describe this image in detail.",
      },
    ],
  });

  return response;
}