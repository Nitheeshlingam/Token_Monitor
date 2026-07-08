import db from "../config/db.js";

export const getTodayDashboard = async (req, res) => {
    try {

        const [rows] = await db.execute(`
            SELECT
                COUNT(*) AS totalRequests,
                IFNULL(SUM(input_tokens),0) AS totalInputTokens,
                IFNULL(SUM(output_tokens),0) AS totalOutputTokens,
                IFNULL(SUM(total_tokens),0) AS totalTokens,
                IFNULL(SUM(estimated_cost),0) AS totalCost
            FROM request_logs
            WHERE DATE(created_at)=CURDATE()
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