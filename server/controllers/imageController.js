import { analyzeImageWithGemini } from "../services/geminiService.js";
import db from "../config/db.js";

export const analyzeImage = async (req, res) => {
  // Start latency timer
  const startTime = Date.now();

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

        if (i === 2) throw err;

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Calculate latency AFTER Gemini responds
    const latencyMs = Date.now() - startTime;

    // Token Usage
    const usage = response.usageMetadata || {};

    const inputTokens = usage.promptTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || 0;
    const apiTotalTokens = usage.totalTokenCount || 0;
    const billableTokens = inputTokens + outputTokens;

    // Get pricing
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

    // USD → INR
    const USD_TO_INR = 95.45;

    const inputCostUSD =
      (inputTokens / 1_000_000) *
      Number(pricing.input_price_per_million);

    const outputCostUSD =
      (outputTokens / 1_000_000) *
      Number(pricing.output_price_per_million);

    const estimatedCost = Number(
      ((inputCostUSD + outputCostUSD) * USD_TO_INR).toFixed(6)
    );

    // Save Request Log
    await db.execute(
      `
      INSERT INTO request_logs
      (
          user_id,
          project_id,
          provider,
          model,
          input_tokens,
          output_tokens,
          billable_tokens,
          api_total_tokens,
          estimated_cost,
          latency_ms,
          status,
          image_name,
          sdk_key,
          sdk_version,
          environment
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        req.user.id,
        req.application.id,
        "Gemini",
        model,
        inputTokens,
        outputTokens,
        billableTokens,
        apiTotalTokens,
        estimatedCost,
        latencyMs,
        "SUCCESS",
        req.file.filename,
        req.sdk.sdkKey,
        req.sdk.sdkVersion,
        req.sdk.environment,
      ]
    );

    res.json({
      success: true,
      description: response.text,
      usage,
      model,
      estimatedCost,
      currency: "INR",
      latencyMs,
    });

  } catch (error) {
    console.error(error);

    // Log failed request
    try {
      await db.execute(
        `
        INSERT INTO request_logs
        (
            user_id,
            project_id,
            provider,
            model,
            status,
            error_message,
            sdk_key,
            sdk_version,
            environment
        )
        VALUES (?,?,?,?,?,?,?,?,?)
        `,
        [
          req.user?.id || null,
          req.application?.id || null,
          "Gemini",
          req.body?.model || "gemini-2.5-flash-lite",
          "FAILED",
          error.message,
          req.sdk?.sdkKey || null,
          req.sdk?.sdkVersion || null,
          req.sdk?.environment || null,
        ]
      );
    } catch (logError) {
      console.error("Failed to save request log:", logError);
    }

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