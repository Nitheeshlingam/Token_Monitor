import { analyzeImageWithGemini } from "../services/geminiService.js";
import db from "../config/db.js";

export const analyzeImage = async (req, res) => {
  const startTime = Date.now();

  // Make user available to both try and catch
  let user = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // Get logged-in user details
    const [users] = await db.execute(
      `
      SELECT
        name,
        email
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    if (users.length > 0) {
      user = users[0];
    }

    console.log("Logged User:", user);

    const model = req.body.model || "gemini-2.5-flash-lite";

    let response;

    // Retry Gemini API
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

    const latencyMs = Date.now() - startTime;

    const usage = response.usageMetadata || {};

    const inputTokens = usage.promptTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || 0;
    const apiTotalTokens = usage.totalTokenCount || 0;
    const billableTokens = inputTokens + outputTokens;

    // Pricing
    const [priceRows] = await db.execute(
      `
      SELECT
        input_price_per_million,
        output_price_per_million
      FROM model_pricing
      WHERE model_name=?
      ORDER BY effective_from DESC
      LIMIT 1
      `,
      [model]
    );

    if (priceRows.length === 0) {
      throw new Error(`Pricing not found for ${model}`);
    }

    const pricing = priceRows[0];

    const USD_TO_INR = 95.45;

    const inputCost =
      (inputTokens / 1000000) *
      Number(pricing.input_price_per_million);

    const outputCost =
      (outputTokens / 1000000) *
      Number(pricing.output_price_per_million);

    const estimatedCost = Number(
      ((inputCost + outputCost) * USD_TO_INR).toFixed(6)
    );

    // Save request log
    await db.execute(
      `
      INSERT INTO request_logs
      (
        user_id,
        user_name,
        user_email,
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
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        req.user.id,
        user?.name || null,
        user?.email || null,
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

    return res.json({
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

    try {

      await db.execute(
        `
        INSERT INTO request_logs
        (
          user_id,
          user_name,
          user_email,
          project_id,
          provider,
          model,
          status,
          error_message,
          sdk_key,
          sdk_version,
          environment
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
          req.user?.id || null,
          user?.name || null,
          user?.email || null,
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

    return res.status(500).json({
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