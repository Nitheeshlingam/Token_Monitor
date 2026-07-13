import db from "../config/db.js";

// ===========================================
// Dashboard Summary
// ===========================================

export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate, model = "ALL" } = req.query;

    let conditions = [];
    let params = [];

    if (startDate) {
      conditions.push("DATE(rl.created_at) >= ?");
      params.push(startDate);
    }

    if (endDate) {
      conditions.push("DATE(rl.created_at) <= ?");
      params.push(endDate);
    }

    if (model !== "ALL") {
      conditions.push("rl.model = ?");
      params.push(model);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [rows] = await db.execute(
      `
      SELECT
        COUNT(*) AS totalRequests,

        COALESCE(SUM(rl.input_tokens),0) AS inputTokens,

        COALESCE(SUM(rl.output_tokens),0) AS outputTokens,

        COALESCE(SUM(rl.billable_tokens),0) AS billableTokens,

        COALESCE(SUM(rl.estimated_cost),0) AS estimatedCost,

        COALESCE(
          SUM(CASE WHEN rl.status='SUCCESS' THEN 1 ELSE 0 END),
          0
        ) AS successRequests,

        COALESCE(
          SUM(CASE WHEN rl.status='FAILED' THEN 1 ELSE 0 END),
          0
        ) AS failedRequests

      FROM request_logs rl

      ${whereClause}
      `,
      params
    );

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===========================================
// Request History
// ===========================================

export const getHistory = async (req, res) => {
  try {

    const [rows] = await db.execute(`
      SELECT
        rl.id,
        u.name,
        u.email,
        rl.provider,
        rl.model,
        rl.image_name,
        rl.input_tokens,
        rl.output_tokens,
        rl.billable_tokens,
        rl.estimated_cost,
        rl.latency_ms,
        rl.status,
        rl.created_at

      FROM request_logs rl

      LEFT JOIN users u
      ON rl.user_id = u.id

      ORDER BY rl.created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ===========================================
// Daily Usage
// ===========================================

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
      data: rows,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ===========================================
// Models
// ===========================================

export const getModels = async (req, res) => {
  try {

    const { startDate, endDate } = req.query;

    let conditions = ["model IS NOT NULL"];
    let params = [];

    if (startDate) {
      conditions.push("DATE(created_at) >= ?");
      params.push(startDate);
    }

    if (endDate) {
      conditions.push("DATE(created_at) <= ?");
      params.push(endDate);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const [rows] = await db.execute(
      `
      SELECT DISTINCT model

      FROM request_logs

      ${whereClause}

      ORDER BY model
      `,
      params
    );

    const models = rows.map((row) => row.model);

    res.json({
      success: true,
      models,
      defaultModel:
        models.length === 1
          ? models[0]
          : "ALL",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ===========================================
// Dashboard Details
// ===========================================

export const getDetails = async (req, res) => {
  try {

    const {
      type,
      startDate,
      endDate,
      model = "ALL",
    } = req.query;

    let conditions = [];
    let params = [];

    if (startDate) {
      conditions.push("DATE(rl.created_at) >= ?");
      params.push(startDate);
    }

    if (endDate) {
      conditions.push("DATE(rl.created_at) <= ?");
      params.push(endDate);
    }

    if (model !== "ALL") {
      conditions.push("rl.model = ?");
      params.push(model);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [rows] = await db.execute(
      `
      SELECT

        rl.id,

        u.name,

        u.email,

        rl.provider,

        rl.model,

        rl.image_name,

        rl.input_tokens,

        rl.output_tokens,

        rl.billable_tokens,

        rl.estimated_cost,

        rl.status,

        rl.created_at

      FROM request_logs rl

      LEFT JOIN users u
      ON rl.user_id = u.id

      ${whereClause}

      ORDER BY rl.created_at DESC
      `,
      params
    );

    res.json({
      success: true,
      type,
      data: rows,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};