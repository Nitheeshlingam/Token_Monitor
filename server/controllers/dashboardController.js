import db from "../config/db.js";

export const getSummary = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        COUNT(*) AS totalRequests,
        COALESCE(SUM(input_tokens),0) AS inputTokens,
        COALESCE(SUM(output_tokens),0) AS outputTokens,
        COALESCE(SUM(billable_tokens),0) AS billableTokens,
        COALESCE(SUM(estimated_cost),0) AS estimatedCost,
        COALESCE(AVG(latency_ms),0) AS avgLatency,
        COALESCE(SUM(CASE WHEN status='SUCCESS' THEN 1 ELSE 0 END),0) AS successRequests,
        COALESCE(SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END),0) AS failedRequests
      FROM request_logs
      WHERE DATE(created_at) = CURDATE()
    `);

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
export const getHistory = async (req, res) => {
  try {

    const [rows] = await db.execute(`
      SELECT
        id,
        provider,
        model,
        image_name,
        input_tokens,
        output_tokens,
        billable_tokens,
        estimated_cost,
        latency_ms,
        status,
        created_at
      FROM request_logs
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

export const getDailyUsage = async (req, res) => {
  try {

    const [rows] = await db.execute(`
      SELECT
        DATE(created_at) AS day,
        COUNT(*) AS requests,
        COALESCE(SUM(input_tokens),0) AS inputTokens,
        COALESCE(SUM(output_tokens),0) AS outputTokens,
        COALESCE(SUM(billable_tokens),0) AS billableTokens,
        COALESCE(SUM(estimated_cost),0) AS estimatedCost
      FROM request_logs
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};