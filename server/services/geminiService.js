import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeImageWithGemini(
  filePath,
  mimeType,
  model = "gemini-2.5-flash-lite"
) {
  const fileBytes = fs.readFileSync(filePath);

  // Different prompt for Image and PDF
  let prompt = "";

  if (mimeType.startsWith("image/")) {
    prompt = `
Analyze this image thoroughly.
`;
  } else if (mimeType === "application/pdf") {
    prompt = `
Analyze this PDF thoroughly.

Provide:

Document Title
Document Type
Purpose
Complete Summary
Section-wise Explanation
Important Dates
Important Numbers
People Mentioned
Organizations Mentioned
Tables
Charts
Key Findings
Recommendations
Conclusion
`;
  } else {
    throw new Error("Unsupported file type");
  }

  // Use the model selected by the user
  const result = await ai.models.generateContent({
    model,
    contents: [
      {
        inlineData: {
          data: fileBytes.toString("base64"),
          mimeType,
        },
      },
      {
        text: prompt,
      },
    ],
  });

  // Extract AI response safely
  const text =
    result.text ||
    result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") ||
    "";
console.log(result.usageMetadata);
  return {
    text,
    usageMetadata: result.usageMetadata,
    modelVersion: model,
  };
}