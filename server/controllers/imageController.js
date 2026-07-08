import { analyzeImageWithGemini } from "../services/geminiService.js";
import db from "../config/db.js";

export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // Call Gemini
    let response;

for (let i = 0; i < 3; i++) {
  try {
    response = await analyzeImageWithGemini(
      req.file.path,
      req.file.mimetype
    );

    break;

  } catch (err) {

    console.log(`Gemini attempt ${i + 1} failed`);

    if (i === 2) {
      throw err;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

    // Get token usage
    const usage = response.usageMetadata;

    const inputTokens = usage.promptTokenCount;
    const outputTokens = usage.candidatesTokenCount;
    const totalTokens = usage.totalTokenCount;

    // Fetch model pricing from database
    const [priceRows] = await db.execute(
      `
      SELECT
        input_price_per_million,
        output_price_per_million
      FROM model_pricing
      WHERE model_name = ?
      ORDER BY effective_from DESC
      LIMIT 1
      `,
      [response.modelVersion]
    );

    if (priceRows.length === 0) {
      return res.status(500).json({
        success: false,
        message: `Pricing not found for model ${response.modelVersion}`,
      });
    }

    
    const pricing = priceRows[0];

    // Calculate cost
    const inputCost =
      (inputTokens / 1000000) *
      Number(pricing.input_price_per_million);

    const outputCost =
      (outputTokens / 1000000) *
      Number(pricing.output_price_per_million);

    const estimatedCost = inputCost + outputCost;

    // Save request log
    await db.execute(
      `
      INSERT INTO request_logs
      (
        provider,
        model,
        input_tokens,
        output_tokens,
        total_tokens,
        estimated_cost,
        latency_ms,
        status,
        image_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        "Gemini",
        response.modelVersion,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        0,
        "SUCCESS",
        req.file.filename,
      ]
    );

    res.json({
      success: true,
      description: response.text,
      usage,
      estimatedCost,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  
};
