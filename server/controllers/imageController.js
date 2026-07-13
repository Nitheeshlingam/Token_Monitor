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

    // Model selected by user
    const model = req.body.model || "gemini-2.5-flash-lite";

    let response;

    // Retry Gemini API (3 attempts)
    for (let i = 0; i < 3; i++) {
      try {
        response = await analyzeImageWithGemini(
          req.file.path,
          req.file.mimetype,
          model
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

    // Token Usage
    const usage = response.usageMetadata;

    const inputTokens = usage.promptTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || 0;
    const apiTotalTokens = usage.totalTokenCount || 0;
    const billableTokens = inputTokens + outputTokens;

    // Get pricing for selected model
    const [priceRows] = await db.execute(
      `
      SELECT
        input_price_per_million,
        output_price_per_million
      FROM model_pricing
      WHERE model_name = ?
      AND effective_from <= CURDATE()
      ORDER BY effective_from DESC
      LIMIT 1
      `,
      [model]
    );

    if (priceRows.length === 0) {
      return res.status(500).json({
        success: false,
        message: `Pricing not found for model ${model}`,
      });
    }

    const pricing = priceRows[0];

    // ----------------------------------
// Calculate Cost in INR
// ----------------------------------

const USD_TO_INR = 95.45; // Exchange rate

const inputCostUSD =
  (inputTokens / 1000000) *
  Number(pricing.input_price_per_million);

const outputCostUSD =
  (outputTokens / 1000000) *
  Number(pricing.output_price_per_million);

const estimatedCostUSD = inputCostUSD + outputCostUSD;

// Convert USD → INR
const estimatedCost = Number(
  (estimatedCostUSD * USD_TO_INR).toFixed(6)
);

    // Save Request Log
    await db.execute(
`
INSERT INTO request_logs
(
    user_id,
    provider,
    model,
    input_tokens,
    output_tokens,
    billable_tokens,
    api_total_tokens,
    estimated_cost,
    latency_ms,
    status,
    image_name
)
VALUES (?,?,?,?,?,?,?,?,?,?,?)
`,
[
    req.user.id,
    "Gemini",
    model,
    inputTokens,
    outputTokens,
    billableTokens,
    apiTotalTokens,
    estimatedCost,   // Now stored in INR
    0,
    "SUCCESS",
    req.file.filename
]
);

    res.json({
    success: true,
    description: response.text,
    usage,
    model,
    estimatedCost, // INR
    currency: "INR",
  });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAvailableModels = async (req, res) => {
  try {

    const [rows] = await db.execute(`
      SELECT model_name
      FROM model_pricing
      ORDER BY model_name
    `);

    res.json({
      success: true,
      models: rows.map((row) => row.model_name),
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};