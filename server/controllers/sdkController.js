import db from "../config/db.js";
import { getUsdToInrRate } from "../services/exchangeRateService.js";

export const saveSdkLog = async (req, res) => {
  console.log("========== SDK LOG ==========");
  console.log("JWT User:", req.user);
  console.log("SDK Key:", req.headers["x-sdk-key"]);
  try {
   const {
  provider,
  model,
  usage,
  latency,
  status,
  prompt = null,
  imageName = null,
  errorMessage = null,
} = req.body;

// Logged-in user from JWT
const userId = req.user?.id || null;
const userName = req.user?.name || null;
const userEmail = req.user?.email || null;

console.log("Authenticated User:", {
  userId,
  userName,
  userEmail,
});

    // SDK Headers
    const sdkKey = req.headers["x-sdk-key"];
    const sdkVersion = req.headers["x-sdk-version"];
    const environment = req.headers["x-environment"];

    if (!sdkKey) {
      return res.status(400).json({
        success: false,
        message: "SDK Key is missing",
      });
    }

    // Find Application using SDK Key
    const [applications] = await db.execute(
      `
      SELECT id, owner_id
      FROM applications
      WHERE sdk_key = ?
      LIMIT 1
      `,
      [sdkKey]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid SDK Key",
      });
    }

    const application = applications[0];

    // Token Usage
    const inputTokens = usage?.promptTokenCount || 0;
    const outputTokens = usage?.candidatesTokenCount || 0;
    const apiTotalTokens = usage?.totalTokenCount || 0;
    const billableTokens = inputTokens + outputTokens;

    // Pricing
    const [prices] = await db.execute(
      `
      SELECT
        input_price_per_million,
        output_price_per_million
      FROM model_pricing
      WHERE model_name = ?
      ORDER BY effective_from DESC
      LIMIT 1
      `,
      [model]
    );

    let estimatedCost = 0;

    if (prices.length > 0) {
      const price = prices[0];

      const inputCost =
        (inputTokens / 1000000) *
        Number(price.input_price_per_million);

      const outputCost =
        (outputTokens / 1000000) *
        Number(price.output_price_per_million);

      const USD_TO_INR = await getUsdToInrRate();

      estimatedCost = Number(
        ((inputCost + outputCost) * USD_TO_INR).toFixed(6)
      );
    }
console.log("req.user =", req.user);
    // Save Request Log

console.log("========== INSERT VALUES ==========");

console.log([
  userId,
  userName,
  userEmail,
  application.id,
  provider,
  model
]);

    await db.execute(
`
INSERT INTO request_logs
(
  user_id,
  user_name,
  user_email,

  application_id,

  provider,
  model,
  prompt,
  image_name,

  input_tokens,
  output_tokens,
  billable_tokens,
  api_total_tokens,

  estimated_cost,

  latency_ms,

  status,

  error_message,

  sdk_key,
  sdk_version,
  environment
)

VALUES
(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)

`,
[
  userId,
  userName,
  userEmail,

  application.id,

  provider,
  model,
  prompt,
  imageName,

  inputTokens,
  outputTokens,
  billableTokens,
  apiTotalTokens,

  estimatedCost,

  latency,

  status,

  errorMessage,

  sdkKey,
  sdkVersion,
  environment
]
);
const [lastRow] = await db.execute(`
SELECT
id,
user_id,
user_name,
user_email,
application_id
FROM request_logs
ORDER BY id DESC
LIMIT 1
`);

console.log("LAST INSERT:");
console.table(lastRow);

    res.json({
      success: true,
      message: "Telemetry saved successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};