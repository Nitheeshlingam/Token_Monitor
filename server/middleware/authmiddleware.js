import jwt from "jsonwebtoken";
import db from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    console.log("========== AUTH ==========");
    console.log("JWT Token:", token);

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded);

    // Get latest user from DB
    const [rows] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE id = ?
      `,
      [decoded.id]
    );

    console.log("Database Result:", rows);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = rows[0];

    console.log("Authenticated User:", req.user);
    console.log("==========================");

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default authMiddleware;