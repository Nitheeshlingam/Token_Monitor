import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeImageWithGemini(filePath, mimeType) {
  const fileBytes = fs.readFileSync(filePath);

  // Different prompt for Image and PDF
  let prompt = "";

  if (mimeType.startsWith("image/")) {
    prompt = `
Analyze this image in extreme detail.

Explain:

- Every object
- Every person's appearance
- Background
- Lighting
- Camera angle
- Colors
- Emotions
- Activities
- Estimated location
- Estimated time
- Visible text
- Interesting observations

Finally provide a detailed summary.
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

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
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

  return {
    text,
    usageMetadata: result.usageMetadata,
    modelVersion: result.modelVersion,
  };
}